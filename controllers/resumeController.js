import Resume from "../models/Resume.js";
import mongoose from "mongoose";

// Utility function to handle async errors
const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

// Validate MongoDB ObjectId
const validateObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

// Create Resume
export const createResume = asyncHandler(async (req, res) => {
  const { style, resumeData } = req.body;

  if (!style || !resumeData) {
    return res.status(400).json({ message: "Style and resume data are required." });
  }

  const newResume = await Resume.create({
    style,
    resumeData,
    userId: req.user.id,
  });

  res.status(201).json(newResume);
});

// Get All Resumes for Logged-in User
export const getAllResumes = asyncHandler(async (req, res) => {
  const resumes = await Resume.find({ userId: req.user.id });
  res.json(resumes);
});

// Get Specific Resume
export const getResumeById = asyncHandler(async (req, res) => {
  if (!validateObjectId(req.params.id)) {
    return res.status(400).json({ message: "Invalid resume ID format." });
  }

  const resume = await Resume.findOne({ _id: req.params.id, userId: req.user.id });

  if (!resume) {
    return res.status(404).json({ message: "Resume not found or unauthorized access." });
  }

  res.json(resume);
});

// Get Specific Resume
export const getResumeByAnyOne = asyncHandler(async (req, res) => {
  if (!validateObjectId(req.params.id)) {
    return res.status(400).json({ message: "Invalid resume ID format." });
  }

  const resume = await Resume.findOne({ _id: req.params.id });

  if (!resume) {
    return res.status(404).json({ message: "Resume not found" });
  }

  res.json(resume);
});

// Update Resume
export const updateResume = asyncHandler(async (req, res) => {
  const { style, resumeData } = req.body;
  
  if (!validateObjectId(req.params.id)) {
    return res.status(400).json({ message: "Invalid resume ID format." });
  }

  const updatedResume = await Resume.findOneAndUpdate(
    { _id: req.params.id, userId: req.user.id },
    { style, resumeData },
    { new: true }
  );

  if (!updatedResume) {
    return res.status(404).json({ message: "Resume not found or unauthorized update attempt." });
  }

  res.json(updatedResume);
});

// Delete Resume
export const deleteResume = asyncHandler(async (req, res) => {
  if (!validateObjectId(req.params.id)) {
    return res.status(400).json({ message: "Invalid resume ID format." });
  }

  const deletedResume = await Resume.findOneAndDelete({
    _id: req.params.id,
    userId: req.user.id,
  });

  if (!deletedResume) {
    return res.status(404).json({ message: "Resume not found or unauthorized deletion attempt." });
  }

  res.json({ message: "Resume deleted successfully." });
});
