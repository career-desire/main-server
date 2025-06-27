import CoverLetter from "../models/CoverLetter.js";
import mongoose from "mongoose";

// Utility function to handle async errors
const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

// Validate MongoDB ObjectId
const validateObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

// Create CoverLetter
export const createCoverLetter = asyncHandler(async (req, res) => {
  const { coverLetterData, style } = req.body;

  if (!coverLetterData || !style) {
    return res.status(400).json({ message: "Cover letter data and styles are required." });
  }

  const newCoverLetter = await CoverLetter.create({
    coverLetterData,
    style,
    userId: req.user.id,
  });

  res.status(201).json(newCoverLetter);
});

// Get All CoverLetter for Logged-in User
export const getAllCoverLetter = asyncHandler(async (req, res) => {
  const coverLetter = await CoverLetter.find({ userId: req.user.id });
  res.json(coverLetter);
});

// Get Specific CoverLetter
export const getCoverLetterById = asyncHandler(async (req, res) => {
  if (!validateObjectId(req.params.id)) {
    return res.status(400).json({ message: "Invalid CoverLetter ID format." });
  }

  const coverLetter = await CoverLetter.findOne({ _id: req.params.id, userId: req.user.id });

  if (!coverLetter) {
    return res.status(404).json({ message: "CoverLetter not found or unauthorized access." });
  }

  res.json(coverLetter);
});

// Get Specific CoverLetter view by anyone
export const getCoverLetterByAnyne = asyncHandler(async (req, res) => {
  if (!validateObjectId(req.params.id)) {
    return res.status(400).json({ message: "Invalid CoverLetter ID format." });
  }

  const coverLetter = await CoverLetter.findOne({ _id: req.params.id });

  if (!coverLetter) {
    return res.status(404).json({ message: "CoverLetter not found" });
  }

  res.json(coverLetter);
});

// Update CoverLetter
export const updateCoverLetter = asyncHandler(async (req, res) => {
  const { style, coverLetterData } = req.body;
  
  if (!validateObjectId(req.params.id)) {
    return res.status(400).json({ message: "Invalid CoverLetter ID format." });
  }

  const updatedCoverLetter = await CoverLetter.findOneAndUpdate(
    { _id: req.params.id, userId: req.user.id },
    { style, coverLetterData },
    { new: true }
  );

  if (!updatedCoverLetter) {
    return res.status(404).json({ message: "CoverLetter not found or unauthorized update attempt." });
  }

  res.json(updatedCoverLetter);
});

// Delete CoverLetter
export const deleteCoverLetter = asyncHandler(async (req, res) => {
  if (!validateObjectId(req.params.id)) {
    return res.status(400).json({ message: "Invalid CoverLetter ID format." });
  }

  const deletedCoverLetter = await CoverLetter.findOneAndDelete({
    _id: req.params.id,
    userId: req.user.id,
  });

  if (!deletedCoverLetter) {
    return res.status(404).json({ message: "CoverLetter not found or unauthorized deletion attempt." });
  }

  res.json({ message: "CoverLetter deleted successfully." });
});
