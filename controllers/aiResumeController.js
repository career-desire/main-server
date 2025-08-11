import fs from "fs";
import path from "path";
import { extractPlainText } from "../utils/resumeExtractor.js";
import { extractResumeDataWithGemini, generateAIResume, generateAIResumeSection, generateSuggestedResume, spellCheck } from "../utils/aiResumePrompts.js";
import { checkUserCredits, deductUserCredits } from "../utils/creditManager.js";

export const uploadResume = async (req, res) => {
  const file = req.file;
  const user = req.user;
  const { jobRole, experienceYears } = req.body;

  if (!file) {
    return res.status(400).json({ message: "No file uploaded" });
  }

  const filePath = path.join("uploads", file.filename);

  try {
    await checkUserCredits(user, 1);

    const resumeText = await extractPlainText(filePath, file.mimetype);

    if (!resumeText || !resumeText.trim()) {
      throw new Error("Empty Resume");
    }

    const extractedData = await extractResumeDataWithGemini(resumeText);

    const suggestedData = await generateSuggestedResume(jobRole, experienceYears, extractedData);

    const remainingCredits = await deductUserCredits(user, 1, "Used existing resume");
    res.status(200).json({
      message: "Resume uploaded and processed successfully",
      extracted: extractedData,
      suggested: suggestedData,
      resumeText: resumeText,
      remainingCredits
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
  const user = req.user;
  const { jobRole, experienceLevel, industry, country, jobDescription } = req.body;

  if (!jobRole || !experienceLevel) {
    return res.status(400).json({ message: "Missing input field" });
  }

  try {
    await checkUserCredits(user, 1);

    const aiGeneratedResume = await generateAIResume(jobRole, experienceLevel, industry, country, jobDescription);

    const remainingCredits = await deductUserCredits(user, 1, "AI Resume Generation");

    return res.status(200).json({
      message: "Resume Generated",
      generateResume: aiGeneratedResume,
      remainingCredits
    });
  } catch (err) {
    console.error("Resume Generation Error:", err.message);
    res.status(500).json({ message: err.message });
  }
};

export const handleAIGeneratedResumeSection = async (req, res) => {
  const user = req.user;
  const { section, jobTitle, sectionContent } = req.body;

  if (!section) {
    return res.status(400).json({ message: "Section is Empty" });
  }

  if (!jobTitle) {
    return res.status(400).json({ message: "Fill all the required fields to continue!." });
  }

  try {
    await checkUserCredits(user, 1);

    const aiGeneratedResumeSection = await generateAIResumeSection(section, jobTitle, sectionContent);

    const remainingCredits = await deductUserCredits(user, 1, "AI Resume Section Generation");

    return res.status(200).json({
      message: "Resume Section Generated",
      generateResumeSection: aiGeneratedResumeSection,
      remainingCredits
    });
  } catch (err) {
    console.error("Resume Generation Error:", err.message);
    res.status(500).json({ message: err.message });
  }
};

export const handleSpellCheck = async (req, res) => {
  const { sectionContent } = req.body;

  if (!sectionContent) {
    return res.status(400).json({ message: "Input is Empty" });
  }

  try {
    const spellCheckResult = await spellCheck(sectionContent);

    return res.status(200).json({
      message: "Spell check successfully completed",
      generateSpellCheck: spellCheckResult
    });
  } catch (err) {
    console.error("Spell check Error:", err.message);
    res.status(500).json({ message: err.message });
  }
};