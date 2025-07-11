import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

export const askGemini = async (prompt) => {
  const result = await model.generateContent(prompt);
  const text = result.response.text().replace(/```json|```/g, "").trim();

  try {
    return JSON.parse(text);
  } catch (err) {
    console.error("❌ Gemini returned invalid JSON:", err.message);
    throw new Error("Gemini response was not valid JSON");
  }
};