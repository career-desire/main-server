import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
  createResume,
  getAllResumes,
  getResumeById,
  updateResume,
  deleteResume,
  getResumeByAnyOne,
} from "../controllers/resumeController.js";
import { upload } from "../middleware/multer.js";
import { handleAIGeneratedResume, handleAIGeneratedResumeSection, handleSpellCheck, uploadResume } from "../controllers/aiResumeController.js";
import { aiAttemptLimiter } from "../utils/attemptLimiter.js";

const router = express.Router();

// Define routes with controllers
router.get("/view-only/:id", getResumeByAnyOne);
router.post("/", protect, createResume);
router.get("/", protect, getAllResumes);
router.get("/:id", protect, getResumeById);
router.put("/:id", protect, updateResume);
router.delete("/:id", protect, deleteResume);

// Ai resume
router.post("/upload", protect, aiAttemptLimiter, upload.single("resumeFile"), uploadResume);
router.post("/ai-resume", protect, aiAttemptLimiter, handleAIGeneratedResume);
router.post("/ai-resume-section", protect, aiAttemptLimiter, handleAIGeneratedResumeSection);
router.post("/spell-check", protect, aiAttemptLimiter, handleSpellCheck);

export default router;