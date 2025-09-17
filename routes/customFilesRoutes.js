import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { uploadCustom, uploadCustomFile } from "../controllers/customFileController.js";

const router = express.Router();

router.post(
    "/upload",
    protect,
    uploadCustom.single("file"),
    uploadCustomFile
);

export default router;