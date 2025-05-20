import admin from "firebase-admin";

// Initialize Firebase Admin SDK
admin.initializeApp();

export const sendMobileOTP = async (mobile) => {
  try {
    const otp = Math.floor(100000 + Math.random() * 900000); // Generate a random OTP
    const message = `Your OTP is: ${otp}`;

    // Send OTP using Firebase Admin SDK (e.g., via SMS)
    await admin.messaging().send({
      token: mobile, // This assumes you are sending via Firebase, adjust accordingly
      notification: {
        title: "OTP Verification",
        body: message,
      },
    });

    // Store OTP in Firebase/Redis with an expiration
    // You could also use Redis or Firebase Firestore to store OTPs with expiry
    await admin.firestore().collection("otps").doc(mobile).set({
      otp,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
    });

    return true;
  } catch (error) {
    console.error("Error in sendMobileOTP:", error);
    return false;
  }
};

export const verifyMobileOTP = async (mobile, otp) => {
  try {
    const otpRecord = await admin.firestore().collection("otps").doc(mobile).get();

    if (!otpRecord.exists) {
      return false;
    }

    const { otp: storedOtp, timestamp } = otpRecord.data();

    // Check if OTP is expired (e.g., 10 minutes)
    if (Date.now() - timestamp.toMillis() > 10 * 60 * 1000) {
      return false;
    }

    return storedOtp === otp;
  } catch (error) {
    console.error("Error in verifyMobileOTP:", error);
    return false;
  }
};
