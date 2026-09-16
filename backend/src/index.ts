import path from 'path';
import dotenv from 'dotenv';

dotenv.config();
if (!process.env.JWT_SECRET) {
  dotenv.config({ path: path.resolve(__dirname, '../../.env') });
}
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import authRouter from './routes/auth';
import assessRouter from './routes/assess';
import portfolioRouter from './routes/portfolio';
import scoreRouter from './routes/score';
import leadsRouter from './routes/leads';
import adminRouter from './routes/admin';
import chatRouter from './routes/chat';
import contactRouter from './routes/contact';
import supportRouter from './routes/support';
import { errorHandler } from './middleware/error';
import { authMiddleware } from './middleware/auth';
import { csrfMiddleware } from './middleware/csrf';
import cookieParser from 'cookie-parser';

// Verify required environment variables
const requiredEnvVars = [
  'DATABASE_URL',
  'JWT_SECRET',
  'GMAIL_APP_PASSWORD',
  'GOOGLE_CLIENT_ID',
  'GOOGLE_CLIENT_SECRET',
  'GROK_API_KEY',
];

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    console.error(`Error: Missing required environment variable ${envVar}`);
    process.exit(1);
  }
}

// Warn if GMAIL_USER is missing, since nodemailer relies on it
if (!process.env.GMAIL_USER) {
  console.warn(
    'Warning: GMAIL_USER environment variable is not set. OTP emails might fail.',
  );
}

const app = express();
app.set('trust proxy', 1);
const PORT = process.env.PORT || 5000;

// ─── Security Middlewares ───────────────────────────────────────────────────
app.use(helmet());

// F13: CORS — allow configured FRONTEND_URL, Vercel deployments (*.vercel.app), and local dev
const allowedOrigins = process.env.FRONTEND_URL
  ? process.env.FRONTEND_URL.split(',').map((o) => o.trim().replace(/\/$/, ''))
  : ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:3002'];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g. server-side Next.js rewrites, mobile apps, Postman)
      if (!origin) {
        return callback(null, true);
      }

      const normalizedOrigin = origin.trim().replace(/\/$/, '');
      let isVercel = false;
      try {
        const hostname = new URL(origin).hostname;
        isVercel = hostname === 'vercel.app' || hostname.endsWith('.vercel.app');
      } catch {}

      const isAllowed =
        isVercel ||
        allowedOrigins.some(
          (allowed) => allowed.replace(/\/$/, '') === normalizedOrigin,
        );

      if (isAllowed) {
        callback(null, true);
      } else {
        console.warn(
          `CORS blocked request from origin: ${origin}. Allowed origins:`,
          allowedOrigins,
        );
        callback(null, false);
      }
    },
    credentials: true,
  }),
);

// F8: Explicit JSON body size limit to prevent payload abuse
app.use(express.json({ limit: '50kb' }));

// Cookie parser (must come before CSRF)
app.use(cookieParser());

// CSRF protection (double-submit cookie, exempts Bearer tokens)
app.use(csrfMiddleware);

// F5: Global rate limiter — 200 requests per 15 min per IP
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: 'Too many requests, please try again later.',
  },
});
app.use(globalLimiter);

// Trigger reload to pick up new Prisma Client schema fields
// Root info route
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Arijit De API Server is running',
    health: '/api/health',
  });
});

app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    data: { status: 'healthy' },
  });
});

// CSRF bootstrap — safe GET that sets the csrf_token cookie
import crypto from 'crypto';
app.get('/api/csrf', (req, res) => {
  if (!req.cookies?.csrf_token) {
    res.cookie('csrf_token', crypto.randomBytes(32).toString('hex'), {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 24 * 60 * 60 * 1000,
    });
  }
  res.json({ success: true });
});

// F7: Serve uploaded files behind authentication instead of publicly
app.use(
  '/uploads',
  authMiddleware,
  express.static(path.join(__dirname, '../uploads')),
);

app.use('/api/auth', authRouter);

app.use('/api/assess', assessRouter);
app.use('/api/portfolio', portfolioRouter);
app.use('/api/score', scoreRouter);
app.use('/api/leads', leadsRouter);
app.use('/api/admin', adminRouter);
app.use('/api/chat', chatRouter);
app.use('/api/contact', contactRouter);
app.use('/api/support', supportRouter);

// Global Error Handler
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// ─── Render Keep-Alive ──────────────────────────────────────────────────────
// Prevents the Render free tier service from sleeping by pinging itself every 10 minutes
const RENDER_EXTERNAL_URL = process.env.RENDER_EXTERNAL_URL;
if (RENDER_EXTERNAL_URL) {
  console.log(`Setting up Render Keep-Alive for ${RENDER_EXTERNAL_URL}`);
  setInterval(() => {
    fetch(`${RENDER_EXTERNAL_URL}/api/health`)
      .then((res) => console.log(`[Keep-Alive] Ping successful: ${res.status}`))
      .catch((err) => console.error(`[Keep-Alive] Ping failed:`, err.message));
  }, 10 * 60 * 1000); // 10 minutes
}
