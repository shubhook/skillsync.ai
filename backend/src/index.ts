import { config } from './config';

import express, { NextFunction, Request, Response } from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import { generateProjects, GenerationError } from './gemini';
import { parseAiRequest } from './schemas';

const app = express();

// Vercel puts one proxy in front of the app. Trusting it makes req.ip the client's IP,
// which the rate limiters key on.
app.set('trust proxy', 1);
app.disable('x-powered-by');

class HttpError extends Error {
  constructor(public readonly status: number, message: string) {
    super(message);
  }
}

// CORS configuration
app.use(cors({
  origin(origin, callback) {
    if (!origin || config.allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new HttpError(403, 'Origin not allowed'));
    }
  },
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type'],
}));

app.use(express.json({ limit: '10kb' }));

// Rate limiting configuration
// Note: counters live in memory, so each serverless instance keeps its own.
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

// Health check endpoint
app.get('/', (_req: Request, res: Response) => {
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
app.post('/ai', aiLimiter, aiHourlyLimiter, async (req: Request, res: Response) => {
  const parsed = parseAiRequest(req.body);
  if (!parsed.ok) {
    res.status(400).json({ error: parsed.error });
    return;
  }
  const dataset = parsed.value;

  console.log(`[${new Date().toISOString()}] Generating project suggestions for:`, JSON.stringify(dataset));

  try {
    const response = await generateProjects(dataset);
    console.log(`[${new Date().toISOString()}] Success - Generated ${response.projects.length} projects`);
    res.json({ response });
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error:`, error);
    if (error instanceof GenerationError) {
      res.status(error.status).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Failed to generate project suggestions. Please try again.' });
    }
  }
});

// 404 handler
app.use((_req: Request, res: Response) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Error handler. Covers CORS rejections and body-parser errors (bad JSON, oversized body),
// which Express would otherwise answer with an HTML page.
app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  if (err instanceof HttpError) {
    res.status(err.status).json({ error: err.message });
    return;
  }

  const status = typeof err === 'object' && err !== null && 'status' in err && typeof err.status === 'number'
    ? err.status
    : 500;

  if (status === 413) {
    res.status(413).json({ error: 'Request body is too large' });
  } else if (status === 400) {
    res.status(400).json({ error: 'Request body must be valid JSON' });
  } else {
    console.error(`[${new Date().toISOString()}] Unhandled error:`, err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

if (!config.isProduction) {
  if (!config.geminiApiKey) {
    console.error('GEMINI_API_KEY is not set. Add it to the .env file in the repo root.');
    process.exit(1);
  }
  app.listen(config.port, () => {
    console.log(`Server is running on port ${config.port}`);
    console.log(`Rate limits: AI endpoint - 5/min, 30/hour`);
  });
}

export default app;
