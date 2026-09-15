const fs = require('fs');
const file = 'backend/src/routes/auth.ts';
let code = fs.readFileSync(file, 'utf8');

// Password Login
code = code.replace(/router\.post\('\/pan\/login', authLimiter,/g, "router.post('/pan/login', passwordLoginLimiter,");

// OTP Send
code = code.replace(/router\.post\('\/password\/reset\/send-otp', authLimiter,/g, "router.post('/password/reset/send-otp', otpSendLimiter,");
code = code.replace(/router\.post\('\/activation\/send-otp', authLimiter,/g, "router.post('/activation/send-otp', otpSendLimiter,");

fs.writeFileSync(file, code);
