import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
  createResume,
  getAllResumes,
  getResumeById,
  updateResume,
  deleteResume,
} from "../controllers/resumeController.js";

const router = express.Router();

// Define routes with controllers
router.post("/", protect, createResume);
router.get("/", protect, getAllResumes);
router.get("/:id", protect, getResumeById);
router.put("/:id", protect, updateResume);
router.delete("/:id", protect, deleteResume);

export default router;