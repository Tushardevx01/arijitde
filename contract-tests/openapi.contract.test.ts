// Mock Prisma before any other imports
const mockPrisma = {
  user: { findUnique: jest.fn(), findMany: jest.fn(), create: jest.fn(), update: jest.fn(), delete: jest.fn() },
  lead: { findUnique: jest.fn(), findMany: jest.fn(), create: jest.fn(), update: jest.fn(), delete: jest.fn() },
  existingClient: { findUnique: jest.fn(), findMany: jest.fn(), create: jest.fn(), update: jest.fn(), delete: jest.fn() },
  folio: { findUnique: jest.fn(), findMany: jest.fn(), create: jest.fn(), update: jest.fn(), delete: jest.fn() },
  assessment: { findUnique: jest.fn(), findMany: jest.fn(), create: jest.fn(), update: jest.fn(), delete: jest.fn() },
  portfolio: { findUnique: jest.fn(), findMany: jest.fn(), create: jest.fn(), update: jest.fn(), delete: jest.fn() },
  portfolioRow: { findUnique: jest.fn(), findMany: jest.fn(), create: jest.fn(), update: jest.fn(), delete: jest.fn() },
  score: { findUnique: jest.fn(), findMany: jest.fn(), create: jest.fn(), update: jest.fn(), delete: jest.fn() },
  advisorySession: { findUnique: jest.fn(), findMany: jest.fn(), create: jest.fn(), update: jest.fn(), delete: jest.fn() },
  refreshToken: { findUnique: jest.fn(), findMany: jest.fn(), create: jest.fn(), update: jest.fn(), delete: jest.fn(), deleteMany: jest.fn() },
  client: { findUnique: jest.fn(), findMany: jest.fn(), create: jest.fn(), update: jest.fn(), delete: jest.fn(), upsert: jest.fn() },
  supportQuery: { findUnique: jest.fn(), findMany: jest.fn(), create: jest.fn(), update: jest.fn(), delete: jest.fn() },
  contactMessage: { findUnique: jest.fn(), findMany: jest.fn(), create: jest.fn(), update: jest.fn(), delete: jest.fn() },
  $queryRaw: jest.fn(),
  $transaction: jest.fn(),
};

jest.mock('../../src/lib/prisma', () => ({
  prisma: {
    user: { findUnique: jest.fn(), findMany: jest.fn(), create: jest.fn(), update: jest.fn(), delete: jest.fn() },
    lead: { findUnique: jest.fn(), findMany: jest.fn(), create: jest.fn(), update: jest.fn(), delete: jest.fn() },
    existingClient: { findUnique: jest.fn(), findMany: jest.fn(), create: jest.fn(), update: jest.fn(), delete: jest.fn() },
    folio: { findUnique: jest.fn(), findMany: jest.fn(), create: jest.fn(), update: jest.fn(), delete: jest.fn() },
    assessment: { findUnique: jest.fn(), findMany: jest.fn(), create: jest.fn(), update: jest.fn(), delete: jest.fn() },
    portfolio: { findUnique: jest.fn(), findMany: jest.fn(), create: jest.fn(), update: jest.fn(), delete: jest.fn() },
    portfolioRow: { findUnique: jest.fn(), findMany: jest.fn(), create: jest.fn(), update: jest.fn(), delete: jest.fn() },
    score: { findUnique: jest.fn(), findMany: jest.fn(), create: jest.fn(), update: jest.fn(), delete: jest.fn() },
    advisorySession: { findUnique: jest.fn(), findMany: jest.fn(), create: jest.fn(), update: jest.fn(), delete: jest.fn() },
    refreshToken: { findUnique: jest.fn(), findMany: jest.fn(), create: jest.fn(), update: jest.fn(), delete: jest.fn(), deleteMany: jest.fn() },
    client: { findUnique: jest.fn(), findMany: jest.fn(), create: jest.fn(), update: jest.fn(), delete: jest.fn(), upsert: jest.fn() },
    supportQuery: { findUnique: jest.fn(), findMany: jest.fn(), create: jest.fn(), update: jest.fn(), delete: jest.fn() },
    contactMessage: { findUnique: jest.fn(), findMany: jest.fn(), create: jest.fn(), update: jest.fn(), delete: jest.fn() },
    $queryRaw: jest.fn(),
    $transaction: jest.fn(),
  },
}

import request from 'supertest';
import express from 'express';
import OpenApiValidator from 'express-openapi-validator';
import { requestIdMiddleware } from '../../src/middleware/requestId';
import { errorHandler } from '../../src/middleware/error';
import { ApiError } from '../../src/lib/api-error';
import cookieParser from 'cookie-parser';
import authRouter from '../../src/routes/auth';
import assessRouter from '../../src/routes/assess';
import portfolioRouter from '../../src/routes/portfolio';
import scoreRouter from '../../src/routes/score';
import leadsRouter from '../../src/routes/leads';
import adminRouter from '../../src/routes/admin';
import chatRouter from '../../src/routes/chat';
import contactRouter from '../../src/routes/contact';
import supportRouter from '../../src/routes/support';
import metricsRouter from '../../src/routes/metrics';
import { getApiPrefix } from '../../src/config/apiVersion';
import { metricsMiddleware } from '../../src/routes/metrics';

describe('OpenAPI Contract Tests', () => {
  let app: ReturnType<typeof express>;
  const apiPrefix = getApiPrefix();

  beforeEach(() => {
    app = express();
    app.use(express.json({ limit: '50kb' }));
    app.use(cookieParser());
    app.use(requestIdMiddleware);

    // Add metrics middleware
    app.use((req, res, next) => {
      // Simple metrics middleware for testing
      next();
    }

    // Initialize all routes with OpenAPI validator
    const apiPrefix = getApiPrefix();
    app.use(`${apiPrefix}/auth`, authRouter);
    app.use(`${apiPrefix}/assess`, assessRouter);
    app.use(`${apiPrefix}/portfolio`, portfolioRouter);
    app.use(`${apiPrefix}/score`, scoreRouter);
    app.use(`${apiPrefix}/leads`, leadsRouter);
    app.use(`${apiPrefix}/admin`, adminRouter);
    app.use(`${apiPrefix}/chat`, chatRouter);
    app.use(`${apiPrefix}/contact`, contactRouter);
    app.use(`${apiPrefix}/support`, supportRouter);
    app.use(`${apiPrefix}/metrics`, metricsRouter);

    // OpenAPI Validator middleware
    app.use(
      OpenApiValidator.middleware({
        apiSpec: './src/lib/openapi.json',
        validateRequests: true,
        validateResponses: true,
        validateSecurity: {
          handlers: {
            bearerAuth: (req, auth, scopes) => {
              // Mock bearer auth for testing
              return Promise.resolve(true);
            },
            csrfToken: (req, auth, scopes) => {
              return Promise.resolve(true);
            },
            cookieAuth: (req, auth, scopes) => {
              return Promise.resolve(true);
            },
          },
        },
      })
    );

    app.use((req, res, next) => {
      next(ApiError.notFound('Route not found'));
    }
    app.use((err, req, res, next) => {
      // Sentry would capture the error automatically
      next(err);
    }
    app.use(require('../../src/middleware/error').errorHandler);
  }

  describe('Auth Endpoints Contract', () => {
    it('POST /api/v1/auth/register should validate request body', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({
          email: 'invalid-email',
          password: 'short',
        })
        .expect(400);

      expect(res.body.title).toBe('Validation Error');
    }

    it('POST /api/v1/auth/login should validate request body', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'invalid',
        })
        .expect(400);

      expect(res.body.title).toBe('Validation Error');
    }
  }

  describe('Assessment Endpoints Contract', () => {
    it('POST /api/v1/assess should validate required fields', async () => {
      const res = await request(app)
        .post('/api/v1/assess')
        .send({})
        .expect(400);

      expect(res.body.title).toBe('Validation Error');
    }
  }

  describe('Portfolio Endpoints Contract', () => {
    it('POST /api/v1/portfolio should validate required fields', async () => {
      const res = await request(app)
        .post('/api/v1/portfolio')
        .send({})
        .expect(400);

      expect(res.body.title).toBe('Validation Error');
    }
  }

  describe('Leads Endpoints Contract', () => {
    it('POST /api/v1/leads should validate required fields', async () => {
      const res = await request(app)
        .post('/api/v1/leads')
        .send({
          name: 'Test',
          // Missing phone
        })
        .expect(400);

      expect(res.body.title).toBe('Validation Error');
    }
  }

  describe('Contact Endpoint Contract', () => {
    it('POST /api/v1/contact should validate required fields', async () => {
      const res = await request(app)
        .post('/api/v1/contact')
        .send({})
        .expect(400);

      expect(res.body.title).toBe('Validation Error');
    }
  }

  describe('Support Endpoints Contract', () => {
    it('POST /api/v1/support should validate required fields', async () => {
      const res = await request(app)
        .post('/api/v1/support')
        .send({})
        .expect(400);

      expect(res.body.title).toBe('Validation Error');
    }
  }

  describe('Health Endpoints Contract', () => {
    it('GET /api/health should return healthy status', async () => {
      const res = await request(app)
        .get('/api/health')
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('healthy');
    }
  }

  describe('Error Response Format Contract', () => {
    it('should return RFC 7807 Problem Details format for 404', async () => {
      const res = await request(app)
        .get('/api/v1/nonexistent')
        .expect(404);

      expect(res.body.type).toBeDefined();
      expect(res.body.title).toBeDefined();
      expect(res.body.status).toBe(404);
      expect(res.body.detail).toBeDefined();
      expect(res.body.instance).toBeDefined();
    }

    it('should return RFC 7807 Problem Details format for validation errors', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({
          email: 'invalid',
          password: '123',
        })
        .expect(400);

      expect(res.body.type).toBeDefined();
      expect(res.body.title).toBe('Validation Error');
      expect(res.body.status).toBe(400);
      expect(res.body.detail).toBeDefined();
      expect(res.body.instance).toBeDefined();
      expect(Array.isArray(res.body.errors)).toBe(true);
    }
  }
}
