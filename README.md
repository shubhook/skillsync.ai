# SkillSync.ai

> Find curated project ideas based on your tech stack, powered by AI.

## Features

- AI-powered project suggestions using Google Gemini
- Select from predefined tech stacks or add custom ones
- Get difficulty levels, estimated time, resources, and learning outcomes
- Clean, responsive UI with Tailwind CSS

## Tech Stack

**Frontend:** React, Vite, Tailwind CSS  
**Backend:** Node.js, Express, Google Gemini AI

## Setup

1. **Clone and install dependencies:**
```bash
git clone <repo-url>
cd backend && npm install
cd ../frontend && npm install
```

2. **Create `.env` in root directory:**
```env
GEMINI_API_KEY=your_api_key_here
PORT=3000
```

3. **Create `frontend/.env`:**
```env
VITE_API_URL=http://localhost:3000
```

4. **Run the app:**
```bash
# Terminal 1 - Backend
cd backend && npm run dev

# Terminal 2 - Frontend  
cd frontend && npm run dev
```

Visit `http://localhost:3001`

## Project Structure

```
├── backend/
│   ├── config.js          # Configuration
│   ├── index.js           # Express server
│   └── utils/api.js       # Gemini AI integration
├── frontend/
│   └── src/
│       ├── App.jsx        # Main component
│       └── index.css      # Styles
└── README.md
```

## Known Issues & Improvements

**Needs fixing:**
- Error handling and validation
- Rate limiting on API calls
- Input sanitization
- Loading states

**Future ideas:**
- Save/bookmark projects
- Project filtering
- Dark/light mode toggle
- TypeScript migration
- Export to PDF/Markdown
- Community Projects Database

## License

MIT License - feel free to use this for learning and personal projects.