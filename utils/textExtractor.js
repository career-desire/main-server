// utils/resumeExtractor.js
import fs from "fs/promises";
import pdfParse from "pdf-parse";
import mammoth from "mammoth";
import textract from "textract";
import path from "path";

// Convert MIME type to handler
function getFileTypeFromMime(mimeType) {
    switch (mimeType) {
        case "application/pdf":
            return "pdf";
        case "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
            return "docx";
        case "application/msword":
            return "doc";
        case "text/plain":
            return "txt";
        default:
            return null;
    }
}


async function safeDelete(filePath) {
    try {
        const absolutePath = path.resolve(filePath);
        await fs.access(absolutePath);
        await fs.unlink(absolutePath);
    } catch (err) {
        console.warn(`Could not delete ${filePath}: ${err.message}`);
    }
}


export const extractPlainText = async (filePath, mimeType) => {
    let extractedText = "";
    const fileType = getFileTypeFromMime(mimeType);
    if (!fileType) {
        throw new Error(`Unsupported file type: ${mimeType}`);
    }

    try {
        switch (fileType) {
            case "pdf": {
                const dataBuffer = await fs.readFile(filePath);
                const data = await pdfParse(dataBuffer);
                extractedText = data.text;
                break;
            }
            case "docx": {
                const result = await mammoth.extractRawText({ path: filePath });
                extractedText = result.value;
                break;
            }
            case "doc":
            case "txt": {
                extractedText = await new Promise((resolve, reject) => {
                    textract.fromFileWithPath(filePath, (error, text) => {
                        if (error) return reject(error);
                        resolve(text);
                    });
                });
                break;
            }
            default:
                throw new Error(`No extraction method for type: ${fileType}`);
        }

        return extractedText.trim();
    } catch (error) {
        throw new Error(`Error extracting text: ${error.message}`);
    } finally {
        await safeDelete(filePath);
    }
};
