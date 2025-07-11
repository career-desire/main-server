// utils/resumeExtractor.js
import fs from "fs/promises";
import pdfParse from "pdf-parse";
import mammoth from "mammoth";

export const extractPlainText = async (filePath, mimeType) => {
    const buffer = await fs.readFile(filePath);
    if (mimeType === "application/pdf") {
        const data = await pdfParse(buffer);
        return data.text;
    } else if (mimeType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
        const result = await mammoth.extractRawText({ buffer });
        return result.value;
    } else {
        throw new Error("Unsupported file type");
    }
};