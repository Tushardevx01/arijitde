const fs = require('fs');
const file = 'backend/src/routes/auth.ts';
let code = fs.readFileSync(file, 'utf8');

const newLimiters = `/**
 * Rate limiter for OTP sending endpoints to prevent spam.
 */
const otpSendLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: 'Too many OTP requests. Please wait 15 minutes and try again.',
  },
});

/**
 * Rate limiter for password-based login endpoints to prevent brute-force attacks.
 */
const passwordLoginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: 'Too many login attempts. Please wait 15 minutes and try again.',
  },
});

/**
 * General rate limiter for authentication verification endpoints.
 */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 attempts per window
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: 'Too many authentication attempts. Please wait 15 minutes and try again.',
  },
});`;

code = code.replace(/\/\/ Rate limiter for sensitive auth endpoints[\s\S]*?\}\);\n/, newLimiters + '\n');

// Replace authLimiter in specific routes
// OTP Send
code = code.replace(/router\.post\('\/otp\/send', authLimiter,/g, "router.post('/otp/send', otpSendLimiter,");
code = code.replace(/router\.post\('\/client\/otp\/send', authLimiter,/g, "router.post('/client/otp/send', otpSendLimiter,");
// Password Login
code = code.replace(/router\.post\('\/admin\/login', authLimiter,/g, "router.post('/admin/login', passwordLoginLimiter,");

fs.writeFileSync(file, code);
