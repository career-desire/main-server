import mongoose from "mongoose";

// Define structure to store resume in mongodb
const resumeSchema = new mongoose.Schema({
  resumeData: { type: Object, required: true },
  style: { type: Object, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("Resume", resumeSchema);