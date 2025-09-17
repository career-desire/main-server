import mongoose from "mongoose";

const customFilesSchema = new mongoose.Schema({
    fileURL: { type: String, required: true },
    fileName: { type: String, required: true },
    fileType: { type: String, required: true },
    userName: { type: String, required: true },
    userMobile: { type: String, required: true },
    documentType: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
})

export default mongoose.model("CustomFiles", customFilesSchema);