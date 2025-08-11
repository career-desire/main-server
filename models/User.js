import mongoose from "mongoose";
import bcrypt from "bcryptjs";

// Define structure to store user in mongodb
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  mobile: { type: String, required: true },
  role: { type: String, default: "user" },
  createdAt: { type: Date, default: Date.now },
  creditInfo: {
    totalCredits: { type: Number, default: 20 },       // Total available credits
    creditsUsed: { type: Number, default: 0 },         // Credits used so far
    // lastReset: { type: Date, default: Date.now },      // For monthly reset (if any)
    transactions: [
      {
        action: { type: String, enum: ["spend", "recharge"] },
        amount: { type: Number }, // credits added/removed
        details: { type: String },
        status: { type: String }, // "success" or "failed"
        date: { type: Date, default: Date.now },
      }
    ]
  }
});


// Hash password before saving user
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Compare hashed password
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

export default mongoose.model("User", userSchema);