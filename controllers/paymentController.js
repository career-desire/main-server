import crypto from "crypto";
import mongoose from "mongoose";
import User from "../models/User.js";
import Order from "../models/Order.js";
import { razorpayInstance } from "../utils/razorpay.js";

export const createRazorpayOrder = async (req, res) => {
  try {
    const { tokens } = req.body;

    if (!tokens || !Number.isInteger(tokens) || tokens <= 0) {
      return res.status(400).json({ message: "Invalid token amount" });
    }

    const amount = tokens * 1; // ₹1 per token

    const options = {
      amount: amount * 100, // Razorpay takes amount in paise
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
    };

    const razorpayOrder = await razorpayInstance.orders.create(options);

    await Order.create({
      userId: req.user.id,
      tokens,
      amount,
      orderId: razorpayOrder.id,
      status: "pending",
    });

    return res.json({
      orderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
    });
  } catch (err) {
    console.error("Order creation error:", err);
    return res.status(500).json({ message: "Order creation failed" });
  }
};

export const verifyRazorpayPayment = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ message: "Missing payment verification" });
    }

    const body = `${razorpay_order_id}|${razorpay_payment_id}`;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ message: "Invalid payment signature" });
    }

    const order = await Order.findOne({
      orderId: razorpay_order_id,
    }).session(session);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (order.status === "paid") {
      await session.abortTransaction();
      return res.status(200).json({ message: "Payment already verified", credits: undefined });
    }

    order.status = "paid";
    order.razorpayPaymentId = razorpay_payment_id;
    order.razorpaySignature = razorpay_signature;
    order.verifiedAt = new Date();
    await order.save({ session });

    const user = await User.findById(order.userId).session(session);
    if (!user) {
      await session.abortTransaction();
      return res.status(404).json({ message: "User not found" });
    }

    user.creditInfo.totalCredits += order.tokens;
    user.creditInfo.transactions.unshift({
      action: "recharge",
      amount: order.tokens,
      details: `Razorpay Recharge ₹${order.amount}`,
      status: "success",
      date: new Date(),
    });

    await user.save({ session });

    await session.commitTransaction();
    return res.json({ message: "Payment verified successfully", credits: user.creditInfo.totalCredits });
  } catch (err) {
    console.error("Payment verification error:", err);
    await session.abortTransaction();
    return res.status(500).json({ message: "Payment verification failed" });
  } finally {
    session.endSession();
  }
};
