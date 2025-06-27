import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
  createCoverLetter,
  getAllCoverLetter,
  getCoverLetterById,
  updateCoverLetter,
  deleteCoverLetter,
  getCoverLetterByAnyone,
} from "../controllers/coverLetterController.js";

const router = express.Router();

// Define routes with controllers
router.get("/view-only/:id", getCoverLetterByAnyone);
router.post("/", protect, createCoverLetter);
router.get("/", protect, getAllCoverLetter);
router.get("/:id", protect, getCoverLetterById);
router.put("/:id", protect, updateCoverLetter);
router.delete("/:id", protect, deleteCoverLetter);

export default router;