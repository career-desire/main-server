import path from "path";
import { extractPlainText } from "../utils/textExtractor.js";
import { atsReportWithGemini } from "../utils/atsPrompt.js";
// import { checkUserCredits, deductUserCredits } from "../utils/creditManager.js";

export const checkATS = async (req, res) => {
  try {
    const file = req.file;
    const jobDescription = req.body.description;
    const user = req.user;

    if (!file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const filePath = path.join("uploads", file.filename);

    // await checkUserCredits(user, 1);

    const resumeText = await extractPlainText(filePath, file.mimetype);

    if (!resumeText || !resumeText.trim()) {
      throw new Error("EMPTY_RESUME_TEXT");
    }

    // console.log("Extracted resume text length:", resumeText.length);

    const atsReport = await atsReportWithGemini(resumeText, jobDescription);

    // const remainingCredits = await deductUserCredits(user, 1, "Used existing resume");

    res.status(200).json({
      message: "Resume uploaded and processed successfully",
      atsReport: atsReport,
      resumeText: resumeText
      // remainingCredits
    });
  } catch (error) {
    console.error("Resume Extraction Error:", error.message);

    let message = "Something went wrong while processing the resume.";

    if (error.message === "EMPTY_RESUME_TEXT") {
      message = "The resume appears empty or image-based.";
    } else if (error.message.includes("Gemini returned invalid JSON")) {
      message = "AI resume generation failed. Please try again later.";
    }

    res.status(500).json({
      message,
      error: error.message,
    });
  }
};