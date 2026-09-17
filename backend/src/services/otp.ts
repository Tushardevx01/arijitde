import { randomInt, createHmac } from 'crypto';
import { transporter } from './email';
import { redis, isRedisAvailable } from '../lib/redis';

// In-memory fallback for local dev without Redis
const otpStore = new Map<
  string,
  { otpHash: string; expiresAt: Date; attempts: number }
>();

const OTP_TTL_SECONDS = 600; // 10 minutes
const MAX_ATTEMPTS = 5;

const _otpSecret = process.env.OTP_SECRET || process.env.JWT_SECRET;
if (!_otpSecret) {
  throw new Error(
    'OTP_SECRET (or JWT_SECRET fallback) environment variable is missing',
  );
}
const OTP_SECRET = _otpSecret;

function hashOTP(otp: string): string {
  return createHmac('sha256', OTP_SECRET).update(otp).digest('hex');
}

export function generateOTP(): string {
  return randomInt(100000, 999999).toString();
}

export async function sendOTP(email: string, otp: string): Promise<void> {
  const mailOptions = {
    from: `"FinAnalysis" <${process.env.GMAIL_USER}>`,
    to: email,
    subject: 'Your FinAnalysis Verification Code',
    text: `Your verification code is ${otp}. It will expire in 10 minutes.`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
        <h2 style="color: #0F172A; text-align: center;">FinAnalysis</h2>
        <p style="font-size: 16px; color: #334155;">Hello,</p>
        <p style="font-size: 16px; color: #334155;">Please use the following 6-digit OTP to complete your sign-in process. This OTP is valid for 10 minutes.</p>
        <div style="font-size: 32px; font-weight: bold; letter-spacing: 6px; text-align: center; padding: 15px; margin: 20px 0; background-color: #F1F5F9; border-radius: 6px; color: #2563EB;">
          ${otp}
        </div>
        <p style="font-size: 14px; color: #64748B; text-align: center;">If you did not request this verification code, please ignore this email.</p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (err) {
    console.error('Failed to send OTP email:', err);
    throw new Error(
      'Failed to send OTP. Please check your email configuration.',
    );
  }
}

function otpKey(email: string, purpose: string): string {
  const normalizedEmail = email.toLowerCase();
  const digest = createHmac('sha256', OTP_SECRET)
    .update(`${normalizedEmail}:${purpose}`)
    .digest('hex')
    .slice(0, 16);
  return `otp:${digest}:${purpose}`;
}

export async function saveOTP(
  email: string,
  otp: string,
  purpose: string,
): Promise<void> {
  const key = otpKey(email, purpose);
  const otpHashed = hashOTP(otp);
  const expiresAt = Date.now() + OTP_TTL_SECONDS * 1000;
  const record = { otpHash: otpHashed, expiresAt, attempts: 0 };

  if (isRedisAvailable()) {
    await redis!.setex(key, OTP_TTL_SECONDS, record);
  } else {
    otpStore.set(key, {
      otpHash: otpHashed,
      expiresAt: new Date(expiresAt),
      attempts: 0,
    });
  }
}

const OTP_DELETE_SCRIPT = `
  local key = KEYS[1]
  local expectedHash = ARGV[1]
  local raw = redis.call('GET', key)

  if not raw then return 0 end

  local record = cjson.decode(raw)
  if record.otpHash ~= expectedHash then return 0 end

  redis.call('DEL', key)
  return 1
`;

export async function deleteOTP(
  email: string,
  otp: string,
  purpose: string,
): Promise<void> {
  const key = otpKey(email, purpose);
  const expectedHash = hashOTP(otp);

  if (isRedisAvailable()) {
    await redis!.eval(OTP_DELETE_SCRIPT, [key], [expectedHash]);
  } else {
    const record = otpStore.get(key);
    if (record?.otpHash === expectedHash) {
      otpStore.delete(key);
    }
  }
}

// Lua script for atomic OTP verification on Redis
// Returns: 1 = success, -1 = wrong OTP (attempts incremented), 0 = expired/missing/max attempts
const OTP_VERIFY_SCRIPT = `
  local key = KEYS[1]
  local submittedHash = ARGV[1]
  local now = tonumber(ARGV[2])
  local maxAttempts = tonumber(ARGV[3])

  local raw = redis.call('GET', key)
  if not raw then return 0 end

  local record = cjson.decode(raw)

  local expiresAt = tonumber(record.expiresAt)
  if expiresAt <= now then
    redis.call('DEL', key)
    return 0
  end

  if record.attempts >= maxAttempts then
    redis.call('DEL', key)
    return 0
  end

  if record.otpHash ~= submittedHash then
    record.attempts = record.attempts + 1
    local remainingTtl = math.max(1, math.floor((expiresAt - now) / 1000))
    redis.call('SETEX', key, remainingTtl, cjson.encode(record))
    return -1
  end

  redis.call('DEL', key)
  return 1
`;

export async function verifyOTP(
  email: string,
  otp: string,
  purpose: string,
): Promise<boolean> {
  const key = otpKey(email, purpose);

  if (isRedisAvailable()) {
    const result = (await redis!.eval(
      OTP_VERIFY_SCRIPT,
      [key],
      [hashOTP(otp), Date.now().toString(), MAX_ATTEMPTS.toString()],
    )) as number;
    return result === 1;
  }

  // In-memory fallback (local dev only)
  const record = otpStore.get(key);
  if (!record) return false;

  if (record.expiresAt.getTime() <= Date.now()) {
    otpStore.delete(key);
    return false;
  }

  if (record.attempts >= MAX_ATTEMPTS) {
    otpStore.delete(key);
    return false;
  }

  if (record.otpHash !== hashOTP(otp)) {
    record.attempts += 1;
    return false;
  }

  otpStore.delete(key);
  return true;
}

// In-memory cleanup interval (only runs when Redis is unavailable)
if (!isRedisAvailable()) {
  setInterval(() => {
    const now = Date.now();
    for (const [key, record] of otpStore.entries()) {
      if (record.expiresAt.getTime() <= now) {
        otpStore.delete(key);
      }
    }
  }, 60_000).unref();
}
