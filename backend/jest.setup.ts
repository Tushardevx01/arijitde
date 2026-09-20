// jest.setup.ts
import { jest, afterEach } from '@jest/globals';

// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-jwt-secret-min-32-characters-long';
process.env.OTP_SECRET = 'test-otp-secret-min-32-characters-long';
process.env.OTP_MAX_ATTEMPTS = '5';
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test';
process.env.GMAIL_APP_PASSWORD = 'test';
process.env.GOOGLE_CLIENT_ID = 'test';
process.env.GOOGLE_CLIENT_SECRET = 'test';
process.env.GROK_API_KEY = 'test';
process.env.GMAIL_USER = 'test';
process.env.FRONTEND_URL = 'http://localhost:3000';
process.env.UPSTASH_REDIS_REST_URL = 'https://test.upstash.io';
process.env.UPSTASH_REDIS_REST_TOKEN = 'test-token';

// Mock Redis
jest.mock('@upstash/redis', () => ({
  Redis: jest.fn().mockImplementation(() => ({
    get: jest.fn().mockResolvedValue(null),
    set: jest.fn().mockResolvedValue('OK'),
    setex: jest.fn().mockResolvedValue('OK'),
    del: jest.fn().mockResolvedValue(1),
    eval: jest.fn().mockResolvedValue(1),
    ping: jest.fn().mockResolvedValue('PONG'),
    keys: jest.fn().mockResolvedValue([]),
  })),
}));

// Mock Prisma Client
jest.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      deleteMany: jest.fn(),
      findMany: jest.fn(),
    },
    refreshToken: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      deleteMany: jest.fn(),
    },
    lead: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
    },
    assessment: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    portfolio: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    score: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      upsert: jest.fn(),
    },
    advisorySession: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    existingClient: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      deleteMany: jest.fn(),
    },
    contactMessage: {
      create: jest.fn(),
    },
    supportQuery: {
      findMany: jest.fn(),
      create: jest.fn(),
    },
    $queryRaw: jest.fn(),
    $queryRawUnsafe: jest.fn(),
    $disconnect: jest.fn(),
  },
}));

// Mock Redis
jest.mock('@/lib/redis', () => ({
  redis: {
    get: jest.fn().mockResolvedValue(null),
    set: jest.fn().mockResolvedValue('OK'),
    setex: jest.fn().mockResolvedValue('OK'),
    del: jest.fn().mockResolvedValue(1),
    eval: jest.fn().mockResolvedValue(1),
    ping: jest.fn().mockResolvedValue('PONG'),
    keys: jest.fn().mockResolvedValue([]),
  },
  isRedisAvailable: jest.fn().mockReturnValue(true),
}));

// Mock OTP service
jest.mock('@/services/otp', () => ({
  generateOTP: jest.fn().mockReturnValue('123456'),
  sendOTP: jest.fn().mockResolvedValue(undefined),
  saveOTP: jest.fn().mockResolvedValue(undefined),
  verifyOTP: jest.fn().mockResolvedValue(true),
  deleteOTP: jest.fn().mockResolvedValue(undefined),
}));

// Mock JWT - removed to test actual implementation
// jest.mock('@/lib/jwt', () => ({
//   signAccessToken: jest.fn().mockReturnValue('mock-access-token'),
//   signRefreshToken: jest.fn().mockReturnValue('mock-refresh-token'),
//   verifyAccessToken: jest.fn().mockReturnValue({ userId: 'user-123', email: 'test@example.com', role: 'CLIENT' }),
//   verifyRefreshToken: jest.fn().mockReturnValue({ userId: 'user-123', type: 'refresh' }),
//   signToken: jest.fn().mockReturnValue('mock-token'),
//   verifyToken: jest.fn().mockReturnValue({ userId: 'user-123', email: 'test@example.com', role: 'CLIENT' }),
// });

// Mock email service
jest.mock('@/services/email', () => ({
  transporter: {
    sendMail: jest.fn().mockResolvedValue({ messageId: 'test-message-id' }),
  },
}));

// Mock email service
jest.mock('@/services/email', () => ({
  transporter: {
    sendMail: jest.fn().mockResolvedValue({ messageId: 'test-message-id' }),
  },
}));

// Global test timeout
jest.setTimeout(10000);

// Clean up after each test
afterEach(() => {
  jest.clearAllMocks();
});