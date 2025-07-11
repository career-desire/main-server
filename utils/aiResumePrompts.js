// import { askGeminiWithCache } from "./geminiWithCache.js";
import { askGemini } from "./gemini.js";

const aiExtractedResumePrompt = (resumeText) => `
You are an expert resume parser. Convert the resume text below into the exact JSON format shown.

📌 Guidelines:
- Extract only existing data — no assumptions or hallucination.
- Keep each section logically separate (e.g., do not mix education and experience).
- Include grades in titles if found.
- Follow the structure and field names exactly — no changes, additions, or omissions.

🎯 Output JSON:
{
  name: "", jobTitle: "", email: "", phone: "", location: "",
  linkedin: "", gitHub: "", portfolio: "", blogs: "",
  summary: { title: "Summary", content: "" },
  experience: { title: "Experience", content: [{ title: "", subTitle: "", year: "", description: "" }] },
  skills: { title: "Skills", content: "" },
  education: { title: "Education", content: [{ title: "", subTitle: "", year: "", description: "" }] },
  internship: { title: "Internship", content: [{ title: "", subTitle: "", year: "", description: "" }] },
  project: { title: "Project", content: [{ title: "", year: "", description: "" }] },
  voluntary: { title: "Voluntary", content: [{ title: "", subTitle: "", year: "", description: "" }] },
  course: { title: "Courses", content: [{ title: "", subTitle: "", year: "", description: "" }] },
  awards: { title: "Awards", content: [{ title: "", year: "", description: "" }] },
  languages: { title: "Languages", content: "" },
  custom: { title: "Custom", content: "" }
}

Resume Text:
${resumeText}
`;

export const extractResumeDataWithGemini = async (resumeText) => {
  const prompt = aiExtractedResumePrompt(resumeText);
  return await askGemini(prompt);
};

const aiSuggestedResumePrompt = (jobRole, experienceYears, extractedData) => `
You are a professional resume strategist.

Using the structured resume data below, generate an optimized, ATS-friendly version tailored to the role of ${jobRole}, for a candidate with ${experienceYears} years of experience.

📌 Instructions:
- Improve clarity, impact, and alignment with job role.
- Use strong, action-based language.
- Use only these HTML tags (only in descriptions, summary, and skill section): <strong>, <em>, <u>, <a href="">, <br>, <p>, <ul>/<ol>, <li>, <h1>-<h3> combine tags when needed (e.g., <strong><em>...</em></strong>)
- Do not alter or add to the structure — update values only.

Parsed Resume JSON:
${JSON.stringify(extractedData, null, 2)}
`;


export const generateSuggestedResume = async (jobRole, experienceYears, extractedData) => {
  const prompt = aiSuggestedResumePrompt(jobRole, experienceYears, extractedData);
  return await askGemini(prompt);
};

export const aiGeneratedResumePrompt = (jobRole, experienceLevel, industry = "", country = "", jobDescription = "") => `
You are an expert resume writer. Generate a professional, realistic, and tailored resume based on the input below. Use the exact JSON format provided.

🎯 Output Format (JSON):
{
  name: "", jobTitle: "", email: "", phone: "", location: "",
  linkedin: "", gitHub: "", portfolio: "", blogs: "",
  summary: { title: "Summary", content: "" },
  experience: { title: "Experience", content: [{ title: "", subTitle: "", year: "", description: "" }] },
  skills: { title: "Skills", content: "" },
  education: { title: "Education", content: [{ title: "", subTitle: "", year: "", description: "" }] },
  internship: { title: "Internship", content: [{ title: "", subTitle: "", year: "", description: "" }] },
  project: { title: "Project", content: [{ title: "", year: "", description: "" }] },
  voluntary: { title: "Voluntary", content: [{ title: "", subTitle: "", year: "", description: "" }] },
  course: { title: "Courses", content: [{ title: "", subTitle: "", year: "", description: "" }] },
  awards: { title: "Awards", content: [{ title: "", year: "", description: "" }] },
  languages: { title: "Languages", content: "" },
  custom: { title: "Custom", content: "" }
}

📌 Resume Instructions:
- Target a ${experienceLevel} ${jobRole}${industry ? ` in ${industry}` : ""}${country ? ` (${country})` : ""}.
- Ensure professional tone; no exaggeration.
- Summary: Concise and role-focused.
- Experience: Include 2–3 bullet points per job (use placeholder org names).
- Projects & Courses: Align with ${industry || jobRole}.
- Use only these HTML tags (only in descriptions, summary, and skill section): <strong>, <em>, <u>, <a href="">, <br>, <p>, <ul>/<ol>, <li>, <h1>-<h3>.
- Keep structure clean for reliable PDF parsing.
- Do **not** fill personal details (name, email, etc.).

📄 Input:
- Role: ${jobRole}
- Experience Level: ${experienceLevel}
${industry ? `- Industry: ${industry}` : ""}
${country ? `- Country: ${country}` : ""}
${jobDescription ? `- Job Description: ${jobDescription}` : ""}
`;

export const generateAIResume = async (jobRole, experienceLevel, industry, country, jobDescription) => {
  const prompt = aiGeneratedResumePrompt(jobRole, experienceLevel, industry, country, jobDescription);
  return await askGemini(prompt);
};
