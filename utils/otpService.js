import otpGenerator from "otp-generator";
import NodeCache from "node-cache";
import nodemailer from "nodemailer";

const otpCache = new NodeCache({ stdTTL: 300 }); // OTP expires in 5 mins

// Generate OTP
export const generateOTP = (identifier) => {
    const otp = otpGenerator.generate(6, { upperCaseAlphabets: false, specialChars: false });
    otpCache.set(identifier, otp);
    return otp;
};

// Verify OTP
export const verifyOTP = (identifier, enteredOTP) => {
    const storedOTP = otpCache.get(identifier);
    if (!storedOTP || storedOTP !== enteredOTP) return false;
    otpCache.del(identifier);
    return true;
};

// Send OTP via Email
export const sendEmailOTP = async (email) => {
    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });

    const otp = generateOTP(email);
    await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: email,
        subject: "Your OTP Code",
        text: `Your OTP is ${otp}. It is valid for 5 minutes.`,
    });

    return { message: "OTP sent to email" };
};
