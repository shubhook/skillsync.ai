// Mirrors the response schema in backend/src/schemas.ts. Keep the two in sync.

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

export interface BookmarkedProject extends Project {
  id: string;
  bookmarkedAt: number;
}
