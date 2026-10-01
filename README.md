# SkillSync.ai

> Find curated project ideas based on your tech stack, powered by AI.

## Features

- Project suggestions from Google Gemini, based on the technologies you pick
- Predefined tech stacks, plus custom entries
- Difficulty, estimated time, resources, and learning outcomes for each idea
- Bookmarks saved in the browser (localStorage)
- Per-IP rate limiting on the AI endpoint (5/minute, 30/hour)

## Tech stack

**Frontend:** React 19, TypeScript, Vite, Tailwind CSS
**Backend:** Node.js, Express 5, TypeScript, Google Gemini (`@google/genai`), zod

## Setup

1. Clone and install dependencies:

```bash
git clone https://github.com/shubhook/skillsync.ai.git
cd skillsync.ai/backend && npm install
cd ../frontend && npm install
```

2. Copy `.env.example` to `.env` in the repo root and add your Gemini API key:

```env
GEMINI_API_KEY=your_api_key_here
PORT=3000
```

3. Optional for local dev: copy `frontend/.env.example` to `frontend/.env`. Without it, dev builds call `http://localhost:3000`. Production builds require `VITE_API_URL`.

4. Run the app:

```bash
# Terminal 1 - Backend
cd backend && npm run dev

# Terminal 2 - Frontend
cd frontend && npm run dev
```

Visit `http://localhost:3001`.

## Scripts

| Folder | Command | What it does |
| --- | --- | --- |
| backend | `npm run dev` | Start the API with nodemon. Restarts on changes in `src/` or the root `.env` |
| backend | `npm run typecheck` | Type-check source and tests |
| backend | `npm test` | Run unit tests (vitest) |
| backend | `npm run build` | Compile to `dist/` |
| frontend | `npm run dev` | Start Vite on port 3001 under nodemon. Vite hot-reloads `src/`; nodemon restarts it when `package.json` or the Tailwind/PostCSS config changes |
| frontend | `npm run lint` | ESLint with typescript-eslint |
| frontend | `npm test` | Run unit tests (vitest) |
| frontend | `npm run build` | Type-check and build to `dist/` |

CI runs all of these on every push to `main` and on pull requests.

## Environment variables

| Variable | Where | Required | Notes |
| --- | --- | --- | --- |
| `GEMINI_API_KEY` | backend | yes | |
| `PORT` | backend | no | Defaults to 3000 |
| `GEMINI_MODEL` | backend | no | Defaults to `gemini-2.5-flash` |
| `FRONTEND_URL` | backend | no | Comma-separated origins allowed by CORS, on top of localhost:3001/3002 |
| `VITE_API_URL` | frontend | prod only | Backend base URL |

## API

`POST /ai` with body `{ "dataset": { "language": "Go,Rust", "framework": "", "database": "", "others": "" } }`.
Each field is a comma-separated list. Limits are 20 technologies total and 50 characters per name.
Returns `{ "response": { "projects": [...] } }`, or `{ "error": "..." }` with a 4xx/5xx status.

## Project structure

```
├── backend/
│   └── src/
│       ├── config.ts        # Env loading and config
│       ├── index.ts         # Express app, CORS, rate limits, routes
│       ├── gemini.ts        # Prompt and Gemini call
│       └── schemas.ts       # Request/response validation (zod)
├── frontend/
│   └── src/
│       ├── App.tsx          # Main page
│       ├── components/      # Navbar, TechSelector, ProjectCard, BookmarksPanel, Footer
│       ├── context/         # Bookmarks context and provider
│       ├── lib/             # API client, bookmark storage, URL checks
│       └── types.ts         # Shared frontend types
└── README.md
```

## Roadmap

- UI and user-flow pass (layout, loading states, accessibility)
- More inputs for suggestions: experience level, time budget, interests
- Avoid repeating ideas across regenerations
- Bookmark status and notes, export to Markdown
- Shared rate-limit store for serverless deployments

## License

MIT. See [LICENSE](LICENSE).
