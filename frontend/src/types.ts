// Mirrors the request and response schemas in backend/src/schemas.ts. Keep the two in sync.

export type Difficulty = 'Beginner' | 'Intermediate' | 'Advanced';
export type TimeBudget = 'weekend' | 'weeks' | 'months';
export type Goal = 'portfolio' | 'learning' | 'hackathon';
export type RefineDirection = 'similar' | 'easier' | 'harder';

// Matches the dataset fields the API expects.
export type Category = 'language' | 'framework' | 'database' | 'others';

export interface Tech {
  name: string;
  category: Category;
}

export interface Preferences {
  level?: Difficulty;
  timeBudget?: TimeBudget;
  goal?: Goal;
  interests: string[];
}

export interface Resource {
  name: string;
  type: 'Documentation' | 'Video' | 'Tutorial';
  url: string;
}

export interface Project {
  title: string;
  description: string;
  difficulty: Difficulty;
  estimatedTime: string;
  techStack: string[];
  resources: Resource[];
  learningOutcomes: string[];
}

// A project in a results batch. `variationOf` is set for More like this / Easier / Harder.
export interface ResultProject extends Project {
  id: string;
  variationOf?: { title: string; direction: RefineDirection };
}

export interface Batch {
  id: string;
  createdAt: number;
  techs: Tech[];
  preferences: Preferences;
  projects: ResultProject[];
}

export type BookmarkStatus = 'saved' | 'building' | 'done';

export interface BookmarkedProject extends Project {
  id: string;
  bookmarkedAt: number;
  status: BookmarkStatus;
}
