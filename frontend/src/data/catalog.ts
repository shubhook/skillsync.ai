import type { BookmarkStatus, Category, Difficulty, Goal, Project, Tech, TimeBudget } from '../types';

export const CATEGORY_ORDER: Category[] = ['language', 'framework', 'database', 'others'];

export const CATEGORY_LABELS: Record<Category, string> = {
  language: 'Languages',
  framework: 'Frameworks & runtimes',
  database: 'Databases',
  others: 'Tools & platforms',
};

const group = (category: Category, names: string[]): Tech[] => names.map((name) => ({ name, category }));

export const CATALOG: Tech[] = [
  ...group('language', ['JavaScript', 'TypeScript', 'Python', 'Java', 'Go', 'Rust', 'C/C++', 'C#', 'PHP', 'Kotlin', 'Swift', 'Ruby']),
  ...group('framework', [
    'React.js', 'Next.js', 'Vue.js', 'Svelte', 'Angular', 'Node.js', 'Express.js', 'NestJS',
    'Django', 'Flask', 'FastAPI', 'Spring Boot', 'Ruby on Rails', 'React Native', 'Flutter', 'Tailwind CSS',
  ]),
  ...group('database', ['PostgreSQL', 'MySQL', 'MongoDB', 'Redis', 'SQLite', 'Firebase', 'Supabase', 'DynamoDB']),
  ...group('others', ['Docker', 'Kubernetes', 'AWS', 'Google Cloud', 'Vercel', 'Git', 'GitHub Actions', 'REST API', 'GraphQL', 'WebSockets', 'Stripe', 'LLM APIs']),
];

// Shown while the stack is empty. One click fills the stack and generates.
export const EXAMPLE_STACKS: { label: string; techs: string[] }[] = [
  { label: 'React + Node + Postgres', techs: ['React.js', 'Node.js', 'PostgreSQL'] },
  { label: 'Python + FastAPI + Redis', techs: ['Python', 'FastAPI', 'Redis'] },
  { label: 'Next.js + Supabase', techs: ['Next.js', 'TypeScript', 'Supabase'] },
  { label: 'Go + Docker', techs: ['Go', 'Docker', 'PostgreSQL'] },
];

export const MAX_INTERESTS = 3;

export const INTERESTS = ['Dev tools', 'Health', 'Fintech', 'Education', 'Games', 'Social', 'Climate', 'Productivity', 'Music', 'Travel'];

export const LEVEL_OPTIONS: { value: Difficulty; label: string }[] = [
  { value: 'Beginner', label: 'Beginner' },
  { value: 'Intermediate', label: 'Intermediate' },
  { value: 'Advanced', label: 'Advanced' },
];

export const TIME_OPTIONS: { value: TimeBudget; label: string; short: string }[] = [
  { value: 'weekend', label: 'A weekend', short: 'Weekend' },
  { value: 'weeks', label: '2-4 weeks', short: '2-4 wk' },
  { value: 'months', label: '1-2 months', short: '1-2 mo' },
];

export const GOAL_OPTIONS: { value: Goal; label: string }[] = [
  { value: 'portfolio', label: 'Portfolio' },
  { value: 'learning', label: 'Learning' },
  { value: 'hackathon', label: 'Hackathon' },
];

export const STATUS_OPTIONS: { value: BookmarkStatus; label: string; tone: BookmarkStatus }[] = [
  { value: 'saved', label: 'Saved', tone: 'saved' },
  { value: 'building', label: 'Building', tone: 'building' },
  { value: 'done', label: 'Done', tone: 'done' },
];

// Shown on the first visit so people can see what a result looks like.
export const SAMPLE_PROJECT: Project = {
  title: 'PR Pulse: a review-load dashboard for small teams',
  description:
    'Pulls open pull requests from GitHub, shows who is overloaded with reviews, and suggests reviewers based on recent file ownership. Sends a daily digest to Slack.',
  difficulty: 'Intermediate',
  estimatedTime: '3-4 weeks',
  techStack: ['React.js', 'Node.js', 'PostgreSQL'],
  learningOutcomes: [
    'Consume the GitHub REST API with pagination and rate limits',
    'Model time-series review data in PostgreSQL',
    'Schedule background jobs and send webhooks',
  ],
  resources: [
    { name: 'GitHub REST API docs', type: 'Documentation', url: 'https://docs.github.com/en/rest' },
    { name: 'React docs', type: 'Documentation', url: 'https://react.dev/learn' },
  ],
};
