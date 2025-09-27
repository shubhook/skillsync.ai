const{ GoogleGenerativeAI } = require("@google/generative-ai");

// import all resources
const { GEMINI_API_KEY } = require('../config');
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

// gemini api call
async function apiCall(dataset) {
  const result = await model.generateContent(
   `Generate project suggestions tailored to the user-provided dataset ${JSON.stringify(dataset)}, including required resources for each project, along with link of youtube videos & official documentation if available for how to use the resources. Also provide an esitimated time to build the project. Return only raw JSON, no code blocks or explanations.`
  );
  const text = await result.response.text();
  // console.log(result);
  const cleanText = text.replace(/```json|```/g, '').trim();

  try {
    const json = JSON.parse(cleanText);
    // console.log(json);
    return json;
  } catch (error) {
    console.error("Failed to parse JSON");
    console.error("Raw response from model:\n", text);
  }
}

module.exports = {
  apiCall
}

