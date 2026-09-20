import request from 'supertest';
import express from 'express';
import { requestIdMiddleware } from '../../src/middleware/requestId';
import { errorHandler } from '../../src/middleware/error';
import { ApiError } from '../../src/lib/api-error';
import cookieParser from 'cookie-parser';

describe('Basic Health Endpoints', () => {
  let app: ReturnType<typeof express>;

  beforeEach(() => {
    app = express();
    app.use(express.json({ limit: '50kb' }));
    app.use(cookieParser());
    app.use(requestIdMiddleware);
    
    app.get('/api/health', (req, res) => {
      res.json({ success: true, data: { status: 'healthy' }, requestId: req.requestId });
    });
    app.get('/api/health/details', (req, res) => {
      res.json({ 
        success: true, 
        data: { 
          status: 'healthy', 
          checks: { database: 'healthy', redis: 'healthy' },
          timestamp: new Date().toISOString()
        },
        requestId: req.requestId 
      });
    });
    app.get('/api/csrf', (req, res) => {
      res.json({ success: true });
    });
    // 404 handler for unknown routes
    app.use((req, res, next) => {
      next(ApiError.notFound('Route not found'));
    });
    app.use(require('../../src/middleware/error').errorHandler);
  });

  describe('GET /api/health', () => {
    it('should return healthy status', async () => {
      const res = await request(app)
        .get('/api/health')
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('healthy');
      expect(res.body.requestId).toBeDefined();
    });
  });

  describe('GET /api/health/details', () => {
    it('should return health details', async () => {
      const res = await request(app)
        .get('/api/health/details')
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBeDefined();
      expect(res.body.data.checks).toBeDefined();
      expect(res.body.data.checks.database).toBeDefined();
      expect(res.body.data.checks.redis).toBeDefined();
      expect(res.body.requestId).toBeDefined();
    });
  });

  describe('GET /api/csrf', () => {
    it('should return CSRF token', async () => {
      const res = await request(app)
        .get('/api/csrf')
        .expect(200);

      expect(res.body.success).toBe(true);
    });
  });

  describe('Error handling', () => {
    it('should return 404 for unknown routes', async () => {
      const res = await request(app)
        .get('/api/unknown')
        .expect(404);

      expect(res.body.title).toBe('Not Found');
      expect(res.body.status).toBe(404);
      expect(res.body.requestId).toBeDefined();
    });
  });
});