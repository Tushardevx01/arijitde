import request from 'supertest';
import express from 'express';
import { requestIdMiddleware } from '../../src/middleware/requestId';
import { errorHandler } from '../../src/middleware/error';
import { ApiError } from '../../src/lib/api-error';
import cookieParser from 'cookie-parser';

// Mock Redis for testing
const mockRedisStore = new Map<string, { value: string; expiry?: number }>();

const mockRedis = {
  set: jest.fn(async (key: string, value: string, options?: { ex?: number }) => {
    const expiry = options?.ex ? Date.now() + options.ex * 1000 : undefined;
    mockRedisStore.set(key, { value, expiry });
    return 'OK';
  }),
  get: jest.fn(async (key: string) => {
    const entry = mockRedisStore.get(key);
    if (!entry) return null;
    if (entry.expiry && Date.now() > entry.expiry) {
      mockRedisStore.delete(key);
      return null;
    }
    return entry.value;
  }),
  del: jest.fn(async (key: string) => {
    mockRedisStore.delete(key);
    return 1;
  }),
};

jest.mock('../../src/lib/redis', () => ({
  redis: mockRedis,
  isRedisAvailable: () => true,
}));

describe('Redis Cache Integration', () => {
  let app: ReturnType<typeof express>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockRedisStore.clear();
    
    app = express();
    app.use(express.json({ limit: '50kb' }));
    app.use(cookieParser());
    app.use(requestIdMiddleware);
    
    app.get('/api/health', (req, res) => {
      res.json({ success: true, data: { status: 'healthy' }, requestId: req.requestId });
    });
    app.get('/api/csrf', (req, res) => {
      res.json({ success: true });
    });
    
    // Test cache endpoints
    app.get('/api/test/cache/set', async (req, res, next) => {
      try {
        const { redis } = require('../../src/lib/redis');
        await redis.set('test:key', 'test-value', { ex: 60 });
        res.json({ success: true, message: 'Cache set' });
      } catch (error) {
        next(error);
      }
    });
    
    app.get('/api/test/cache/get', async (req, res, next) => {
      try {
        const { redis } = require('../../src/lib/redis');
        const value = await redis.get('test:key');
        res.json({ success: true, data: value });
      } catch (error) {
        next(error);
      }
    });
    
    app.get('/api/test/cache/delete', async (req, res, next) => {
      try {
        const { redis } = require('../../src/lib/redis');
        await redis.del('test:key');
        res.json({ success: true, message: 'Cache deleted' });
      } catch (error) {
        next(error);
      }
    });
    
    app.use((req, res, next) => {
      next(ApiError.notFound('Route not found'));
    });
    app.use(require('../../src/middleware/error').errorHandler);
  });

  describe('Redis Cache Operations', () => {
    it('should set and get a value from cache', async () => {
      // Set a value
      await request(app)
        .get('/api/test/cache/set')
        .expect(200);

      // Get the value
      const res = await request(app)
        .get('/api/test/cache/get')
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data).toBe('test-value');
    });

    it('should delete a value from cache', async () => {
      // Set a value first
      await request(app)
        .get('/api/test/cache/set')
        .expect(200);

      // Delete the value
      await request(app)
        .get('/api/test/cache/delete')
        .expect(200);

      // Verify it's gone
      const res = await request(app)
        .get('/api/test/cache/get')
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data).toBeNull();
    });

    it('should handle cache expiration', async () => {
      const { redis } = require('../../src/lib/redis');
      
      // Set a value with 1 second TTL
      await redis.set('test:expiry', 'expiring-value', { ex: 1 });

      // Should exist immediately
      const val = await redis.get('test:expiry');
      expect(val).toBe('expiring-value');

      // Wait for expiry
      await new Promise(resolve => setTimeout(resolve, 1100));

      // Should be gone after expiry
      const val2 = await redis.get('test:expiry');
      expect(val2).toBeNull();
    });
  });
});