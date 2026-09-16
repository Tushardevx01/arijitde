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
  return jwt.sign({ ...payload, type: 'access' }, SECRET, { expiresIn: '15m' });
}

export function signRefreshToken(userId: string): string {
  return jwt.sign({ userId, type: 'refresh' } satisfies RefreshPayload, SECRET, {
    expiresIn: '30d',
  });
}

export function verifyAccessToken(token: string): JWTPayload {
  const decoded = jwt.verify(token, SECRET) as any;
  // Reject refresh tokens used as access tokens
  if (decoded.type && decoded.type !== 'access') {
    throw new jwt.JsonWebTokenError('Invalid token type');
  }
  return { userId: decoded.userId, email: decoded.email, role: decoded.role };
}

export function verifyRefreshToken(token: string): RefreshPayload {
  const decoded = jwt.verify(token, SECRET) as any;
  // Reject access tokens used as refresh tokens
  if (decoded.type && decoded.type !== 'refresh') {
    throw new jwt.JsonWebTokenError('Invalid token type');
  }
  return { userId: decoded.userId, type: 'refresh' };
}

// Legacy alias — existing code uses signToken / verifyToken
export function signToken(payload: JWTPayload): string {
  return signAccessToken(payload);
}

export function verifyToken(token: string): JWTPayload {
  return verifyAccessToken(token);
}
