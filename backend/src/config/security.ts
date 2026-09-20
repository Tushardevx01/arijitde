/**
 * Security configuration
 * Centralized security settings for the application
 */

export const SECURITY_CONFIG = {
  // Password hashing
  BCRYPT_ROUNDS: parseInt(process.env.BCRYPT_ROUNDS || '12', 10),
  
  // Token expiry
  ACCESS_TOKEN_EXPIRY: '15m',
  REFRESH_TOKEN_EXPIRY: '30d',
  REFRESH_TOKEN_EXPIRY_MS: 30 * 24 * 60 * 60 * 1000,
  LEGACY_TOKEN_EXPIRY: '24h',
  
  // OTP settings
  OTP_EXPIRY_SECONDS: 600,  // 10 minutes
  OTP_MAX_ATTEMPTS: 5,
  
  // Rate limiting
  RATE_LIMIT_WINDOW_MS: 15 * 60 * 1000,
  RATE_LIMIT_MAX_REQUESTS: 200,
  
  // Request body size limit
  REQUEST_BODY_SIZE_LIMIT: '50kb',
  
  // Password requirements
  PASSWORD_MIN_LENGTH: 8,
  PASSWORD_MAX_LENGTH: 128,
} as const;

// Validate security config on startup
if (SECURITY_CONFIG.BCRYPT_ROUNDS < 10 || SECURITY_CONFIG.BCRYPT_ROUNDS > 15) {
  throw new Error('BCRYPT_ROUNDS must be between 10-15');
}

if (SECURITY_CONFIG.PASSWORD_MIN_LENGTH < 8) {
  throw new Error('PASSWORD_MIN_LENGTH must be at least 8');
}

export type SecurityConfig = typeof SECURITY_CONFIG;