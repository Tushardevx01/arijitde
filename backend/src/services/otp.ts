import { randomInt } from 'crypto';
import { transporter } from './email';
import { redis, isRedisAvailable } from '../lib/redis';

// In-memory fallback for local dev without Redis
const otpStore = new Map<
  string,
  { otp: string; expiresAt: Date; attempts: number }
>();

const OTP_TTL_SECONDS = 600; // 10 minutes
const MAX_ATTEMPTS = 5;

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
    throw new Error('Failed to send OTP. Please check your email configuration.');
  }
}

export async function saveOTP(email: string, otp: string): Promise<void> {
  const key = `otp:${email.toLowerCase()}`;
  const record = { otp, expiresAt: new Date(Date.now() + OTP_TTL_SECONDS * 1000), attempts: 0 };

  if (isRedisAvailable()) {
    await redis!.setex(key, OTP_TTL_SECONDS, JSON.stringify(record));
  } else {
    otpStore.set(key, record);
  }
}

export async function verifyOTP(email: string, otp: string): Promise<boolean> {
  const key = `otp:${email.toLowerCase()}`;

  if (isRedisAvailable()) {
    const raw = await redis!.get<string>(key);
    if (!raw) return false;

    const record = typeof raw === 'string' ? JSON.parse(raw) : raw;
    if (record.attempts >= MAX_ATTEMPTS) {
      await redis!.del(key);
      return false;
    }
    if (record.otp !== otp) {
      await redis!.set(key, JSON.stringify({ ...record, attempts: record.attempts + 1 }), { ex: OTP_TTL_SECONDS });
      return false;
    }

    await redis!.del(key);
    return true;
  }

  // In-memory fallback
  const record = otpStore.get(key);
  if (!record) return false;
  if (record.attempts >= MAX_ATTEMPTS) {
    otpStore.delete(key);
    return false;
  }
  if (record.otp !== otp) {
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
  }, 60_000);
}
