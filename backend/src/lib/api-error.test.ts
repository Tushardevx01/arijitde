import { describe, it, expect } from '@jest/globals';
import { ApiError } from './api-error';
import { z } from 'zod';

describe('ApiError', () => {
  describe('constructor', () => {
    it('should create ApiError with correct properties', () => {
      const error = new ApiError(400, 'Bad Request', 'Invalid input');
      
      expect(error.status).toBe(400);
      expect(error.title).toBe('Bad Request');
      expect(error.detail).toBe('Invalid input');
      expect(error.type).toBe('https://httpstatuses.com/400');
      expect(error.instance).toBe('');
    });

    it('should create ApiError with custom type and extensions', () => {
      const extensions = { field: 'email', code: 'invalid_format' };
      const error = new ApiError(400, 'Validation Error', 'Invalid email', 'custom-type', extensions);
      
      expect(error.type).toBe('custom-type');
      expect(error.extensions).toEqual(extensions);
    });
  });

  describe('toProblemDetails', () => {
    it('should convert to RFC 7807 problem details', () => {
      const error = new ApiError(400, 'Bad Request', 'Invalid input', undefined, { field: 'email' });
      const req = { originalUrl: '/api/test' } as any;
      
      const problem = error.toProblemDetails(req);
      
      expect(problem.type).toBe('https://httpstatuses.com/400');
      expect(problem.title).toBe('Bad Request');
      expect(problem.status).toBe(400);
      expect(problem.detail).toBe('Invalid input');
      expect(problem.instance).toBe('/api/test');
      expect(problem.field).toBe('email');
    });

    it('should use error.instance when req not provided', () => {
      // Use constructor to set instance (it's read-only)
      class TestApiError extends ApiError {
        constructor() {
          super(404, 'Not Found', 'User not found');
          // Use Object.defineProperty to override read-only
          Object.defineProperty(this, 'instance', { value: '/api/users/123', writable: true });
        }
      }
      const error = new TestApiError();
      
      const problem = error.toProblemDetails();
      
      expect(problem.instance).toBe('/api/users/123');
    });
  });

  describe('static factory methods', () => {
    it('should create bad request error', () => {
      const error = ApiError.badRequest('Invalid email', { field: 'email' });
      
      expect(error.status).toBe(400);
      expect(error.title).toBe('Bad Request');
      expect(error.detail).toBe('Invalid email');
      expect(error.extensions).toEqual({ field: 'email' });
    });

    it('should create unauthorized error', () => {
      const error = ApiError.unauthorized('Invalid token');
      
      expect(error.status).toBe(401);
      expect(error.title).toBe('Unauthorized');
      expect(error.detail).toBe('Invalid token');
    });

    it('should create forbidden error', () => {
      const error = ApiError.forbidden('Access denied');
      
      expect(error.status).toBe(403);
      expect(error.title).toBe('Forbidden');
    });

    it('should create not found error', () => {
      const error = ApiError.notFound('User not found');
      
      expect(error.status).toBe(404);
      expect(error.title).toBe('Not Found');
    });

    it('should create conflict error', () => {
      const error = ApiError.conflict('Email already exists');
      
      expect(error.status).toBe(409);
      expect(error.title).toBe('Conflict');
    });

    it('should create too many requests error', () => {
      const error = ApiError.tooManyRequests('Rate limited');
      
      expect(error.status).toBe(429);
      expect(error.title).toBe('Too Many Requests');
    });

    it('should create internal server error', () => {
      const error = ApiError.internal('Something went wrong');
      
      expect(error.status).toBe(500);
      expect(error.title).toBe('Internal Server Error');
    });
  });

  describe('fromZodError', () => {
    it('should convert ZodError to ApiError', () => {
      const schema = z.object({
        email: z.string().email(),
        age: z.number().min(18),
      });
      
      const result = schema.safeParse({ email: 'invalid', age: 15 });
      
      expect(result.success).toBe(false);
      
      const error = ApiError.fromZodError(result.error!);
      
      expect(error.status).toBe(400);
      expect(error.title).toBe('Validation Error');
      expect(error.detail).toContain('email: Invalid email');
      expect(error.detail).toContain('age: Number must be greater than or equal to 18');
      const errors = error.extensions.errors as Array<{ field: string }>;
      expect(errors).toHaveLength(2);
      expect(errors[0]).toHaveProperty('field', 'email');
      expect(errors[1]).toHaveProperty('field', 'age');
    });
  });

  describe('isApiError', () => {
    it('should return true for ApiError instances', () => {
      const error = new ApiError(400, 'Bad Request', 'Invalid input');
      expect(ApiError.isApiError(error)).toBe(true);
    });

    it('should return false for regular errors', () => {
      const error = new Error('Regular error');
      expect(ApiError.isApiError(error)).toBe(false);
    });

    it('should return false for other objects', () => {
      expect(ApiError.isApiError({ status: 400 })).toBe(false);
      expect(ApiError.isApiError(null)).toBe(false);
      expect(ApiError.isApiError(undefined)).toBe(false);
    });
  });
});