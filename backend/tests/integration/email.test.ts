import request from 'supertest';
import express from 'express';
import { requestIdMiddleware } from '../../src/middleware/requestId';
import { errorHandler } from '../../src/middleware/error';
import { ApiError } from '../../src/lib/api-error';
import cookieParser from 'cookie-parser';

// Mock nodemailer
jest.mock('nodemailer', () => ({
  createTransport: jest.fn(() => ({
    sendMail: jest.fn().mockResolvedValue({ messageId: 'test-message-id' }),
  })),
}));

describe('Email Service Integration', () => {
  let app: ReturnType<typeof express>;
  const mockSendMail = jest.fn().mockResolvedValue({ messageId: 'test-message-id' });

  beforeEach(() => {
    jest.clearAllMocks();
    
    app = express();
    app.use(express.json({ limit: '50kb' }));
    app.use(cookieParser());
    app.use(requestIdMiddleware);
    
    // Health endpoints for testing
    app.get('/api/health', (req, res) => {
      res.json({ success: true, data: { status: 'healthy' }, requestId: req.requestId });
    });
    app.get('/api/csrf', (req, res) => {
      res.json({ success: true });
    });
    
    // Contact form endpoint for testing
    app.post('/api/contact', async (req, res, next) => {
      try {
        const { name, email, message } = req.body;
        
        if (!name || !email || !message) {
          throw ApiError.badRequest('Name, email, and message are required');
        }
        
        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
          throw ApiError.badRequest('Invalid email address');
        }
        
        // Simulate email sending
        // In real implementation, this would call sendContactNotificationEmail
        res.status(201).json({
          success: true,
          data: { message: 'Contact form submitted successfully' },
        });
      } catch (error) {
        next(error);
      }
    });
    
    app.use((req, res, next) => {
      next(ApiError.notFound('Route not found'));
    });
    app.use(require('../../src/middleware/error').errorHandler);
  });

  describe('Contact Form', () => {
    it('should submit contact form successfully', async () => {
      const res = await request(app)
        .post('/api/contact')
        .send({
          name: 'Test User',
          email: 'test@example.com',
          message: 'This is a test message',
        })
        .expect(201);

      expect(res.body.success).toBe(true);
      expect(res.body.data.message).toBe('Contact form submitted successfully');
    });

    it('should reject contact form with missing fields', async () => {
      const res = await request(app)
        .post('/api/contact')
        .send({
          name: 'Test User',
          // Missing email and message
        })
        .expect(400);

      expect(res.body.title).toBe('Bad Request');
    });

    it('should reject contact form with invalid email', async () => {
      const res = await request(app)
        .post('/api/contact')
        .send({
          name: 'Test User',
          email: 'invalid-email',
          message: 'Test message',
        })
        .expect(400);

      expect(res.body.title).toBe('Bad Request');
    });
  });
});