import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.join(__dirname, '../../.env') });

import express, { Request, Response } from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import { apiCall, TechDataset } from './utils/api';

const app = express();
const port = process.env.PORT || 3000;

const allowedOrigins: string[] = [
  'http://localhost:3001',
  'http://localhost:3002',
  process.env.FRONTEND_URL || 'https://skillsync-frontend-five.vercel.app'
];

// CORS configuration
app.use(cors({
  origin: function(origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) {
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type']
}));

app.use(express.json());

// Rate limiting configuration
// General rate limiter for all routes
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Max 100 requests per 15 minutes per IP
  message: {
    error: 'Too many requests, please try again later.',
    retryAfter: '15 minutes'
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

// Strict rate limiter for AI endpoint (more expensive operation)
const aiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute window
  max: 5, // Max 5 requests per minute per IP
  message: {
    error: 'Rate limit exceeded. You can only generate 5 project suggestions per minute.',
    retryAfter: '1 minute'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipFailedRequests: false, // Count failed requests against the rate limit
});

// Hourly rate limiter for AI endpoint
const aiHourlyLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour window
  max: 30, // Max 30 requests per hour per IP
  message: {
    error: 'Hourly rate limit exceeded. You can only generate 30 project suggestions per hour.',
    retryAfter: '1 hour'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Apply general rate limiter to all routes
app.use(generalLimiter);

interface AiRequestBody {
  dataset: TechDataset;
}

// Health check endpoint
app.get('/', async (_req: Request, res: Response) => {
  res.json({ 
    status: 'ok',
    message: 'Welcome to SkillSync API',
    endpoints: {
      'POST /ai': 'Generate project suggestions based on tech stack'
    },
    rateLimit: {
      ai: '5 requests/minute, 30 requests/hour'
    }
  });
});

// AI endpoint with strict rate limiting
app.post('/ai', aiLimiter, aiHourlyLimiter, async (req: Request<object, object, AiRequestBody>, res: Response) => {
  const dataset = req.body.dataset;
  
  // Validate request body
  if (!dataset) {
    res.status(400).json({ error: 'Missing dataset in request body' });
    return;
  }

  // Check if at least one technology is provided
  const hasTech = dataset.language || dataset.framework || dataset.database || dataset.others;
  if (!hasTech) {
    res.status(400).json({ error: 'Please provide at least one technology' });
    return;
  }

  console.log(`[${new Date().toISOString()}] Generating project suggestions...`);
  console.log('Tech stack:', JSON.stringify(dataset));

  try {
    const response = await apiCall(dataset);
    console.log(`[${new Date().toISOString()}] Success - Generated ${response.projects.length} projects`);
    res.json({ response });
  } 
  catch (error) {
    console.error(`[${new Date().toISOString()}] Error:`, error);
    res.status(500).json({ error: 'Failed to generate project suggestions. Please try again.' });
  }
});

// 404 handler
app.use((_req: Request, res: Response) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

if (process.env.NODE_ENV !== 'production') {
  app.listen(port, () => { 
    console.log(`Server is running on port ${port}`);
    console.log(`Rate limits: AI endpoint - 5/min, 30/hour`);
  });
}

export default app;
