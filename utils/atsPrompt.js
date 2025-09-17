import { askGeminiWithCache } from "./geminiWithCache.js";

const atsReportPrompt = (resumeText, jobDescription) => {
  return `I have a job description and a resume. Please analyze the resume against the job description and provide a detailed ATS-style evaluation. 
  Respond only in valid JSON (do not use arrays, only comma-separated values inside strings) with the following structure:
- Do not include code blocks or markdown formatting.
- Escape any quotes or special characters inside values.
- No newlines inside values, use spaces instead.


  {
    "checkList": {
      "name": "Candidate full name",
      "jobRole": "Extracted job title or target position",
      "number": "Mobile/Phone number",
      "email": "Email address",
      "linkedIn": "LinkedIn profile hyperlink",
      "location": "Location/City",
      "portfolio": "Portfolio or personal website link",
      "summary": "Profile summary or objective extracted from resume",
      "recognition": "Awards, honors, or notable achievements",
      "education": "Degrees with specialization and institution",
      "projects": "Project titles with short descriptions",
      "certifications": "Certification titles with issuing authority",
      "languages": "Languages known (comma separated)"
    },
    "matchingDetails": {
      "keywordsMatched": "List of important keywords from the job description that are present in the resume",
      "keywordsMissing": "Important keywords from the job description that are missing in the resume",
      "skillsMatched": "Skills found in both job description and resume",
      "skillsMissing": "Skills required by the job description but missing in the resume",
      "experienceMatched": "Experiences from resume that match job description requirements",
      "experienceMissing": "Experiences required by the job description but not found in the resume",
      "educationMatched": "Educational qualifications from resume that match job description",
      "educationMissing": "Required qualifications missing from the resume",
      "actionVerbsUsed": "List of strong action verbs used in resume (e.g., implemented, designed, optimized)",
      "actionVerbsCount": "in number",
      "weakWordsDetected": "List of weak or vague words that reduce impact (e.g., helped, assisted)",
      "overallScore": "ATS compatibility score out of 100, with decimals allowed (not rounded)",
      "readability": "Readability grade of the resume (Excellent, Good, Fair, Poor)",
      "estimatedReadingTime": "Estimated reading time of the resume in minutes",
    },
    "summary": "A concise explanation of how well the resume matches the job description, highlighting strengths and weaknesses",
    "suggestions": "Specific actionable suggestions to improve the resume for better ATS compatibility and recruiter readability"
  }

  Here is the job description:
  ${jobDescription}

  And here is the resume:
  ${resumeText};
  `;
};


export const atsReportWithGemini = async (resumeText, jobDescription) => {
  const prompt = atsReportPrompt(resumeText, jobDescription);
  return await askGeminiWithCache(prompt);
};