import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  tokens: { type: Number, required: true }, // Purchased tokens
  amount: { type: Number, required: true }, // INR (calculated backend)
  // paymentMethod: { type: String, default: "razorpay" },
  orderId: { type: String, required: true },
  razorpayPaymentId: { type: String },
  razorpaySignature: { type: String },
  status: { type: String, enum: ["pending", "paid", "failed"], default: "pending" },
  failureReason: { type: String },
  createdAt: { type: Date, default: Date.now },
  verifiedAt: { type: Date }
});

export default mongoose.model("Order", orderSchema);
