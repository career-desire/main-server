// routes/atsRoutes.js
import express from "express";
import multer from "multer";
import { protect } from "../middleware/authMiddleware.js";
import { checkATS } from "../controllers/atsChecker.js";

const router = express.Router();

// configure multer disk storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    const uniqueName = Date.now() + "-" + file.originalname;
    cb(null, uniqueName);
  },
});

const upload = multer({ storage });

// 👇 expect file field name to be "resume"
router.post("/", protect, upload.single("resume"), checkATS);

export default router;
