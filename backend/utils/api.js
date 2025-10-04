const{ GoogleGenerativeAI } = require("@google/generative-ai");

// import all resources
const { GEMINI_API_KEY } = require('../config');
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

// gemini api call
async function apiCall(dataset) {
  const prompt = `You are a project suggestion API. Generate exactly 3 project suggestions based on this dataset: ${JSON.stringify(dataset)}

Return ONLY valid JSON matching this exact structure (no markdown, no code blocks, no explanations):

{
  "projects": [
    {
      "title": "string",
      "description": "string (2-3 sentences)",
      "difficulty": "Beginner|Intermediate|Advanced",
      "estimatedTime": "string (e.g., '2-3 weeks', '1 month')",
      "techStack": ["string"],
      "resources": [
        {
          "name": "string",
          "type": "Documentation|Video|Tutorial",
          "url": "string (valid URL or 'Not available')"
        }
      ],
      "learningOutcomes": ["string"]
    }
  ]
}

Rules:
- Generate exactly 3 projects
- Each project must have 2-4 resources
- Each project must have 3-5 learning outcomes
- All URLs must be real and valid, or use "Not available"
- estimatedTime must follow format: "X weeks" or "X months"
- techStack array must contain technologies from the user's dataset
- difficulty must be one of: Beginner, Intermediate, Advanced`;
  const result = await model.generateContent(prompt);
  const text = await result.response.text();
  // console.log(result);
  const cleanText = text.replace(/```json|```/g, '').trim();

  try {
    const json = JSON.parse(cleanText);

    if (!json.projects || !Array.isArray(json.projects)) {
      throw new Error("Invalid response structure");
    }

    return json;
  } catch (error) {
    console.error("Failed to parse JSON");
    console.error("Raw response from model:\n", text);
    throw error;
  }
}

module.exports = {
  apiCall
}

