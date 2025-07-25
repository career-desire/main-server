import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
import { getCached, setCached } from "./chachePrompt.js";

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

export const askGeminiWithCache = async (prompt) => {
  const cached = await getCached(prompt);
  if (cached) {
    await new Promise((res) => setTimeout(res, 1500));
    return cached;
  }


  const result = await model.generateContent(prompt);
  const text = result.response.text().replace(/```json|```/g, "").trim();

  try {
    const parsed = JSON.parse(text);
    await setCached(prompt, parsed);
    // console.log("Gemini response cached");
    return parsed;
  } catch (err) {
    console.error("❌ Gemini returned invalid JSON:", err.message);
    throw new Error("Gemini response was not valid JSON");
  }
};
