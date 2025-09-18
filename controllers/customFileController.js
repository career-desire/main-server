import path from "path";
import multer from "multer";
import CustomFiles from "../models/customFiles.js";
import fs from "fs";

const allowedTypes = [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
];

const uploadDir = path.join(process.cwd(), "upload", "custom_files");
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        cb(
            null,
            Date.now() + "-" + Math.round(Math.random() * 1e9) + "-" + file.originalname
        );
    },
});

const fileFilter = (req, file, cb) => {
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error("Only PDF and Word files are allowed"), false);
    }
};

export const uploadCustom = multer({ storage, fileFilter });

export const uploadCustomFile = async (req, res) => {
    try {
        const user = req.user;
        if (!user || user.role !== "admin") {
            return res.status(403).json({ message: "Access denied. Admin only." });
        }

        if (!req.file) {
            return res.status(400).json({ message: "No file uploaded" });
        }

        const { originalname, filename, mimetype } = req.file;
        const { userName, userMobile, documentType } = req.body;

        const fileURL = `/uploads/custom_files/${filename}`;

        let fileType;
        if (mimetype === "application/pdf") {
            fileType = "pdf";
        } else if (
            mimetype === "application/msword" ||
            mimetype === "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        ) {
            fileType = "word";
        } else {
            return res.status(400).json({ message: "Invalid file type" });
        }

        const existingFile = await CustomFiles.findOne({
            fileName: originalname,
            userName,
            userMobile,
            documentType
        });

        if (existingFile) {
            return res.status(400).json({ message: "This file already exists for this user" });
        }

        const newFile = new CustomFiles({
            fileURL,
            fileName: originalname,
            fileType,
            userName,
            userMobile,
            documentType
        });

        await newFile.save();

        return res.status(200).json({
            message: "File uploaded successfully",
            file: newFile
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Server error", error: error.message });
    }
};