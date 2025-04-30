import mongoose from "mongoose";

// Define structure to store CoverLetter in mongodb
const coverLetterSchema = new mongoose.Schema({
  coverLetterData: { type: Object, required: true },
  style: { type: Object, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("CoverLetter", coverLetterSchema);