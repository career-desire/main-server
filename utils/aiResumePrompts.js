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
Generate a professional, realistic, and tailored resume based on the input below. Use the exact JSON format provided.

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
- Do **not** fill personal details (name, email, custom, etc.).

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

export const aiResumeSectionPrompt = (section, jobTitle, sectionContent = "") => {
  const isSimpleSection = section.toLowerCase() === "summary" || section.toLowerCase() === "skills";

  const formatExample = isSimpleSection
    ? `{
  "section": {
    "title": "Section Title",
    "content": "<ul><li><strong>Skill Group:</strong> Skill A, Skill B</li></ul>"
  }
}`
    : `{
  "title": "Job/Project/Degree Title",
  "subTitle": "Company/Institution",
  "year": "Time Period",
  "description": "<ul><li><strong>Responsibility or achievement</strong> here.</li></ul>"
}`;

  return `
🎯 Objective:
Revise and clean the provided **${section}** section content to make it professional, realistic, and well-formatted — tailored to the role of **${jobTitle}**.

📌 Instructions:
- If input content is valid, use it only — do **not** invent or add new information.
- If content is empty or clearly insufficient, generate a **realistic** example aligned with the job title.
- Improve grammar, structure, clarity, and spelling.
- Format as **valid JSON** — return exactly one object.
- Use only valid HTML in \`content\` or \`description\`.

🔹 Allowed HTML tags:
<strong>, <em>, <u>, <a href="">, <br>, <p>, <ul>, <ol>, <li>, <h1>–<h3>

---

🧾 Output Format:
\`\`\`json
${formatExample}
\`\`\`

❌ Do not wrap the output with extra keys like "message", "data", or "generateResumeSection".

---

📄 Provided Input:
${sectionContent}

Strict Note:
📌 Tailor improvements to match the role of ${jobTitle}. If input is provided, keep the content similar and aligned with it.
`;
};

export const generateAIResumeSection = async (section, jobTitle, sectionContent) => {
  const prompt = aiResumeSectionPrompt(section, jobTitle, sectionContent);
  return await askGemini(prompt);
};

export const spellCheckSummaryOrSkills = (sectionContent) => `
You are an expert resume proofreader.

🎯 Task:
Fix grammar, spelling, and punctuation inside the provided **HTML string**. The input comes from a resume section like **Summary** or **Skills**.

📌 Rules:
- Only correct spelling and grammar inside the **text**
- **Do not change** or remove any HTML tags
- Return a **valid JSON string** as the value of the "content" key
- Return ONLY:
\`\`\`json
"content": "<corrected HTML string here>"
\`\`\`

🚫 If the input is invalid or too vague, replace content with:
\`"The information provided seems to be invalid. Please double-check and provide correct details to proceed."\`

🔹 Allowed HTML tags:
<strong>, <em>, <u>, <a href="">, <br>, <p>, <ul>, <ol>, <li>, <h1>–<h3>

📄 Provided Input:
${sectionContent}
`;

export const spellCheckExperienceSections = (sectionContent) => `
You are an expert resume proofreader.

🎯 Task:
Fix grammar, spelling, and punctuation inside the **"content" array** of objects. Each object represents a resume entry (like a job or project).

📌 Rules:
- Fix only the following fields: \`title\`, \`subTitle\`, \`year\`, and \`description\`
- Keep **HTML intact** inside \`description\` — change only the text
- Do **not** add, remove, or rename any fields
- Return **only** the updated "content" array in valid JSON

🚫 If the input is invalid or lacks sufficient information:
- For each object: replace \`description\` with  
  \`"The information provided seems to be invalid. Please double-check and provide correct details to proceed."\`
- Leave all other fields (title, subTitle, year) as empty strings

🔹 Allowed HTML tags in "description":
<strong>, <em>, <u>, <a href="">, <br>, <p>, <ul>, <ol>, <li>, <h1>–<h3>

📄 Provided Input:
${sectionContent}
`;

export const spellCheck = async (section) => {
  let prompt;

  const sectionTitle = section.title
  const sectionContent = section.content
  const type = sectionTitle.toLowerCase();
  if (type === "summary" || type === "skills") {
    prompt = spellCheckSummaryOrSkills(sectionContent);
  } else {
    prompt = spellCheckExperienceSections(sectionContent);
  }

  const response = await askGemini(prompt);
  return response;
};
