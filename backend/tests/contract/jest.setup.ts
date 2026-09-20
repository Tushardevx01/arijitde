// Jest setup file for contract tests
// Sets required environment variables for testing

process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test';
process.env.JWT_SECRET = 'test-jwt-secret-min-32-chars-long';
process.env.OTP_SECRET = 'test-otp-secret-min-32-chars-long';
process.env.PAN_VERIFICATION_SECRET = 'test-pan-verification-secret-min-32-chars';
process.env.GOOGLE_CLIENT_ID = 'test-google-client-id';
process.env.GOOGLE_CLIENT_SECRET = 'test-google-client-secret';
process.env.GMAIL_USER = 'test@example.com';
process.env.GMAIL_APP_PASSWORD = 'test-app-password';
process.env.GROK_API_KEY = 'test-grok-api-key';
process.env.FRONTEND_URL = 'http://localhost:3000';
process.env.ENABLE_REFRESH_TOKENS = 'true';
process.env.UPSTASH_REDIS_REST_URL = 'https://test-redis.upstash.io';
process.env.UPSTASH_REDIS_REST_TOKEN = 'test-redis-token';
process.env.SENTRY_DSN = '';
process.env.NODE_ENV = 'test';