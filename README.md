# SkillSync.ai

> Find curated project ideas based on your tech stack, powered by AI.

## Features

- Project suggestions from Google Gemini, based on the technologies you pick
- Searchable stack picker with a catalog of 48 technologies, custom entries, and one-click example stacks
- Optional tuning: level, time available, goal, and up to 3 interest areas
- Results in batches you can switch between; regenerating never wipes earlier ideas
- "More like this", "Easier", and "Harder" on each idea, without repeating ideas you've already seen
- Copy any idea as a README skeleton in Markdown
- Bookmarks with a status (Saved, Building, Done), undo, and Markdown export
- Light and dark themes (follows your system until you pick one)
- Stack and preferences stored in the URL, so links are shareable
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

## Design system

The frontend follows the "50% polymorphism" design system: shared tokens, with components that may change their element (`as`) and their role styling (variant or density), but never the colors, typeface, radius ladder, or accent.

- Tokens (colors for both themes, radius ladder `tight · mid · soft · shell`, shadow) live in `frontend/src/index.css` and `frontend/tailwind.config.js`.
- Primitives live in `frontend/src/components/ui/`:
  - `Action` (`as`: button · a · span, `variant`: solid · ghost · link · icon)
  - `Card` (`density`: default · compact · featured, `as`: article · div · li)
  - `Segmented` (single-select, `size`: sm · md)
  - `Badge` (`tone`: beginner · intermediate · advanced · neutral)
- `components/ui/contracts.typecheck.tsx` makes the build fail if someone widens those limits.

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
