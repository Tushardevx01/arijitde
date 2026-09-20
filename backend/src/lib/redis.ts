import { Redis } from '@upstash/redis';

const url = process.env.UPSTASH_REDIS_REST_URL;
const token = process.env.UPSTASH_REDIS_REST_TOKEN;
const isProduction = process.env.NODE_ENV === 'production';

if (isProduction) {
  if (!url) {
    throw new Error('UPSTASH_REDIS_REST_URL is required in production');
  }
  if (!token) {
    throw new Error('UPSTASH_REDIS_REST_TOKEN is required in production');
  }
}

export const redis =
  url && token
    ? new Redis({ url, token })
    : null;

export const isRedisAvailable = (): boolean => redis !== null;
