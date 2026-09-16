import jwt from 'jsonwebtoken';
import { Role } from '@prisma/client';

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is missing');
}

const SECRET = JWT_SECRET;

export interface JWTPayload {
  userId: string;
  email: string;
  role: Role;
}

interface RefreshPayload {
  userId: string;
  type: 'refresh';
}

export function signAccessToken(payload: JWTPayload): string {
  return jwt.sign(payload, SECRET, { expiresIn: '15m' });
}

export function signRefreshToken(userId: string): string {
  return jwt.sign({ userId, type: 'refresh' } satisfies RefreshPayload, SECRET, {
    expiresIn: '30d',
  });
}

export function verifyAccessToken(token: string): JWTPayload {
  return jwt.verify(token, SECRET) as unknown as JWTPayload;
}

export function verifyRefreshToken(token: string): RefreshPayload {
  return jwt.verify(token, SECRET) as unknown as RefreshPayload;
}

// Legacy alias — existing code uses signToken / verifyToken
export function signToken(payload: JWTPayload): string {
  return signAccessToken(payload);
}

export function verifyToken(token: string): JWTPayload {
  return verifyAccessToken(token);
}
