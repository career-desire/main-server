import fs from "fs";
import path from "path";
import { extractPlainText } from "../utils/resumeExtractor.js";
import { extractResumeDataWithGemini, generateAIResume, generateSuggestedResume } from "../utils/aiResumePrompts.js";

export const uploadResume = async (req, res) => {
  const file = req.file;
  const user = req.user;
  const { jobRole, experienceYears } = req.body;

  if (!file) {
    return res.status(400).json({ message: "No file uploaded" });
  }

  const filePath = path.join("uploads", file.filename);

  try {
    const resumeText = await extractPlainText(filePath, file.mimetype);

    if (!resumeText || !resumeText.trim()) {
      throw new Error("EMPTY_RESUME_TEXT");
    }

    const extractedData = await extractResumeDataWithGemini(resumeText);
    const suggestedData = await generateSuggestedResume(jobRole, experienceYears, extractedData);

    res.status(200).json({
      message: "Resume uploaded and processed successfully",
      extracted: extractedData,
      suggested: suggestedData,
      resumeText: resumeText,
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
  } finally {
    fs.unlink(filePath, (err) => {
      if (err) console.error("Failed to delete uploaded file:", err.message);
    });
  }
};

export const handleAIGeneratedResume = async (req, res) => {
    const { jobRole, experienceLevel, industry, country, jobDescription } = req.body;

    if (!jobRole || !experienceLevel) {
        return res.status(400).json({ message: "Missing input field" });
    }

    try {
        const aiGeneratedResume = await generateAIResume(jobRole, experienceLevel, industry, country, jobDescription);

        return res.status(200).json({
            message: "Resume Generated",
            generateResume: aiGeneratedResume
        });
    } catch (err) {
        console.error("Resume Generation Error:", err.message);
        res.status(500).json({ message: err.message });
    }
};