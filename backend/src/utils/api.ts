import { GoogleGenerativeAI } from "@google/generative-ai";
import { GEMINI_API_KEY } from '../config';

// Type definitions
export interface Resource {
  name: string;
  type: 'Documentation' | 'Video' | 'Tutorial';
  url: string;
}

export interface Project {
  title: string;
  description: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  estimatedTime: string;
  techStack: string[];
  resources: Resource[];
  learningOutcomes: string[];
}

export interface ProjectsResponse {
  projects: Project[];
}

export interface TechDataset {
  language: string;
  framework: string;
  database: string;
  others: string;
}

if (!GEMINI_API_KEY) {
  console.error('GEMINI_API_KEY is not set in .env file!');
  process.exit(1);
}

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

// Build tech stack description
function buildTechDescription(dataset: TechDataset): string {
  const parts: string[] = [];
  
  if (dataset.language) {
    parts.push(`Programming Languages: ${dataset.language}`);
  }
  if (dataset.framework) {
    parts.push(`Frameworks/Libraries: ${dataset.framework}`);
  }
  if (dataset.database) {
    parts.push(`Databases: ${dataset.database}`);
  }
  if (dataset.others) {
    parts.push(`Other Technologies: ${dataset.others}`);
  }
  
  return parts.join('\n');
}

// gemini api call
export async function apiCall(dataset: TechDataset): Promise<ProjectsResponse> {
  const techDescription = buildTechDescription(dataset);
  
  const prompt = `You are an expert software engineering mentor and project advisor. Your task is to suggest unique, creative, and practical project ideas.

## USER'S TECH STACK:
${techDescription}

## YOUR TASK:
Generate exactly 3 **unique and innovative** project ideas that:
1. Are NOT generic projects like "todo app", "weather app", "chat app", "blog", or "e-commerce store"
2. Solve real-world problems or address interesting niches
3. Can be showcased in a portfolio to impress employers
4. Effectively utilize the user's selected technologies
5. Have varying difficulty levels (include at least one intermediate or advanced project)

## CREATIVITY GUIDELINES:
- Think of projects that combine multiple domains (e.g., fitness + social, finance + gamification)
- Consider projects that use APIs creatively (maps, AI, payments, social media)
- Suggest projects that could potentially become real products or startups
- Include projects that demonstrate system design skills (real-time features, data processing, etc.)
- Avoid overused project ideas - be original and specific

## RESPONSE FORMAT:
Return ONLY valid JSON (no markdown, no code blocks, no extra text):

{
  "projects": [
    {
      "title": "Specific, catchy project name",
      "description": "2-3 sentences explaining what the project does, who it's for, and what makes it unique",
      "difficulty": "Beginner|Intermediate|Advanced",
      "estimatedTime": "X weeks or X-Y months",
      "techStack": ["Only include technologies from user's selection that are relevant"],
      "resources": [
        {
          "name": "Resource title",
          "type": "Documentation|Video|Tutorial",
          "url": "Real, working URL or 'Not available'"
        }
      ],
      "learningOutcomes": ["Specific skill or concept the user will master"]
    }
  ]
}

## STRICT RULES:
- Generate EXACTLY 3 projects
- Each project MUST have 2-4 relevant resources with real URLs
- Each project MUST have 3-5 specific learning outcomes
- techStack MUST only contain technologies from the user's input
- URLs must be real documentation, tutorials, or videos (use official docs when possible)
- Be specific in descriptions - mention exact features, not vague concepts
- Learning outcomes should be concrete skills, not generic statements

Generate creative, portfolio-worthy projects now:`;

  const result = await model.generateContent(prompt);
  const text = result.response.text();
  const cleanText = text.replace(/```json|```/g, '').trim();

  try {
    const json = JSON.parse(cleanText) as ProjectsResponse;

    if (!json.projects || !Array.isArray(json.projects)) {
      throw new Error("Invalid response structure");
    }

    // Validate each project has required fields
    json.projects.forEach((project, index) => {
      if (!project.title || !project.description || !project.difficulty) {
        throw new Error(`Project ${index + 1} is missing required fields`);
      }
    });

    return json;
  } catch (error) {
    console.error("Failed to parse JSON");
    console.error("Raw response from model:\n", text);
    throw error;
  }
}
