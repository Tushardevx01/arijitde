import request from 'supertest';
import express from 'express';
import { requestIdMiddleware } from '../../src/middleware/requestId';
import { errorHandler } from '../../src/middleware/error';
import { ApiError } from '../../src/lib/api-error';
import cookieParser from 'cookie-parser';

// Mock Razorpay at the top level - default mock returns valid signature
const mockVerifyPaymentSignature = jest.fn().mockReturnValue(true);

jest.mock('razorpay', () => {
  return jest.fn().mockImplementation(() => ({
    orders: {
      create: jest.fn().mockResolvedValue({
        id: 'order_test_123',
        amount: 50000,
        currency: 'INR',
        status: 'created',
      }),
    },
    payments: {
      fetch: jest.fn().mockResolvedValue({
        id: 'pay_test_123',
        amount: 50000,
        currency: 'INR',
        status: 'captured',
      }),
    },
    utility: {
      verifyPaymentSignature: mockVerifyPaymentSignature,
    },
  }));
});

describe('Razorpay Payment Integration', () => {
  let app: ReturnType<typeof express>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockVerifyPaymentSignature.mockReturnValue(true);

    app = express();
    app.use(express.json({ limit: '50kb' }));
    app.use(require('cookie-parser')());
    app.use(require('../../src/middleware/requestId').requestIdMiddleware);

    app.get('/api/health', (req, res) => {
      res.json({ success: true, data: { status: 'healthy' }, requestId: req.requestId });
    });
    app.get('/api/csrf', (req, res) => {
      res.json({ success: true });
    });

    // Payment order creation endpoint
    app.post('/api/v1/payment/create-order', async (req, res, next) => {
      try {
        const { amount, currency = 'INR', receipt } = req.body;

        if (!amount || amount <= 0) {
          throw require('../../src/lib/api-error').ApiError.badRequest('Valid amount is required');
        }

        const Razorpay = require('razorpay');
        const razorpay = new Razorpay({
          key_id: 'test_key',
          key_secret: 'test_secret',
        });

        const order = await razorpay.orders.create({
          amount,
          currency: currency || 'INR',
          receipt: receipt || `receipt_${Date.now()}`,
        });

        res.json({
          success: true,
          data: {
            orderId: order.id,
            amount: order.amount,
            currency: order.currency,
          },
        });
      } catch (error) {
        next(error);
      }
    });

    // Payment verification endpoint
    app.post('/api/v1/payment/verify', async (req, res, next) => {
      try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

        if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
          throw require('../../src/lib/api-error').ApiError.badRequest('Missing payment verification parameters');
        }

        const Razorpay = require('razorpay');
        const razorpay = new Razorpay({
          key_id: 'test_key',
          key_secret: 'test_secret',
        });

        const isValid = razorpay.utility.verifyPaymentSignature({
          order_id: razorpay_order_id,
          payment_id: razorpay_payment_id,
          signature: razorpay_signature,
        });

        if (!isValid) {
          throw require('../../src/lib/api-error').ApiError.badRequest('Invalid payment signature');
        }

        res.json({
          success: true,
          data: { verified: true },
        });
      } catch (error) {
        next(error);
      }
    });

    app.use((req, res, next) => {
      next(require('../../src/lib/api-error').ApiError.notFound('Route not found'));
    });
    app.use(require('../../src/middleware/error').errorHandler);
  });

  it('should create a payment order', async () => {
    const res = await request(app)
      .post('/api/v1/payment/create-order')
      .send({
        amount: 50000,
        currency: 'INR',
        receipt: 'test_receipt_123',
      })
      .expect(200);

    expect(res.body.success).toBe(true);
    expect(res.body.data.orderId).toBeDefined();
    expect(res.body.data.amount).toBe(50000);
    expect(res.body.data.currency).toBe('INR');
  });

  it('should reject order creation with invalid amount', async () => {
    const res = await request(app)
      .post('/api/v1/payment/create-order')
      .send({
        amount: -100,
        currency: 'INR',
      })
      .expect(400);

    expect(res.body.title).toBe('Bad Request');
  });

  it('should verify a payment signature', async () => {
    const res = await request(app)
      .post('/api/v1/payment/verify')
      .send({
        razorpay_order_id: 'order_test_123',
        razorpay_payment_id: 'pay_test_123',
        razorpay_signature: 'valid_signature',
      })
      .expect(200);

    expect(res.body.success).toBe(true);
    expect(res.body.data.verified).toBe(true);
  });

  it('should reject verification with missing parameters', async () => {
    const res = await request(app)
      .post('/api/v1/payment/verify')
      .send({
        razorpay_order_id: 'order_test_123',
        // Missing payment_id and signature
      })
      .expect(400);

    expect(res.body.title).toBe('Bad Request');
  });

  it('should reject invalid payment signature', async () => {
    // Override the mock for this specific test
    mockVerifyPaymentSignature.mockReturnValueOnce(false);

    const res = await request(app)
      .post('/api/v1/payment/verify')
      .send({
        razorpay_order_id: 'order_test_123',
        razorpay_payment_id: 'pay_test_123',
        razorpay_signature: 'invalid_signature',
      })
      .expect(400);

    expect(res.body.title).toBe('Bad Request');
  });
});