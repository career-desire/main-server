import { askGeminiWithCache } from "./geminiWithCache.js";
// import { askGemini } from "./gemini.js";

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
  return await askGeminiWithCache(prompt);
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
  return await askGeminiWithCache(prompt);
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
  return await askGeminiWithCache(prompt);
};

export const aiResumeSectionPrompt = (section, jobTitle, sectionContent = "") => `
You are an expert resume writer.

🎯 Objective:
Generate a professional, realistic, and cleanly structured **${section}** section for a resume, specifically tailored to the role of **${jobTitle}**.

📌 Global Rules:
- Use only the provided input data — do **not** fabricate, infer, or assume any additional information.
- Ensure the output is **valid JSON** that is easy to parse.
- HTML formatting is permitted **only within the "content" field**.
- Return **only** the requested section — no extra text, commentary, or formatting outside the section object.
- If the provided job title is invalid, insufficient, or not a real role, return a fallback message: For the summary or skills sections, insert the following message inside the "content" field: "The information provided seems to be invalid. Please double-check your job role and provide correct details to proceed."

For all other sections, insert the same message inside the "description" field of each item keep other field empty.

🔹 Allowed HTML tags (in summary, skills, and descriptions only):
\`<strong>\`, \`<em>\`, \`<u>\`, \`<a href="">\`, \`<br>\`, \`<p>\`, \`<ul>\`, \`<ol>\`, \`<li>\`, \`<h1>\`–\`<h3>\`

---

🧾 Required Output Format:

👉 For **summary** or **skills**:
\`\`\`json
"section": {
  "title": "Section Title",
  "content": "<ul><li><strong>Skill Group:</strong> Skill A, Skill B</li><li><strong>Tools:</strong> Git, Docker</li></ul>"
}
\`\`\`

✅ Notes:
- \`content\` must be a **single HTML string** — not an array or object.
- Do **not** include keys like \`items\`, \`skill\`, \`list\`, etc.

---

👉 For **experience, education, projects**, etc.:
\`\`\`json
"section": {
  "title": "Section Title",
  "content": [
    {
      "title": "Job/Project Title",
      "subTitle": "Company/Platform",
      "year": "Time Period",
      "description": "<ul><li><strong>Did something</strong> impactful here.</li></ul>"
    },
    {
      "title": "Another Title",
      "subTitle": "Another Place",
      "year": "Year/Range",
      "description": "<ul><li>More detailed bullet points</li></ul>"
    }
  ]
}
\`\`\`

✅ Notes:
- Every item must include: \`title\`, \`subTitle\`, \`year\`, and \`description\`.
- Do **not** add any additional fields like \`responsibilities\`, \`highlights\`, etc.

---

📄 Provided Input:
${sectionContent}

📌 Remember to tailor the entire section to the job role: **${jobTitle}**
`;

export const generateAIResumeSection = async (section, jobTitle, sectionContent) => {
  const prompt = aiResumeSectionPrompt(section, jobTitle, sectionContent);
  return await askGeminiWithCache(prompt);
};