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

/**
 * Signs a JWT token with the provided user payload.
 * Generates a token that expires in 24 hours to mitigate security risks 
 * associated with long-lived tokens lacking revocation mechanisms.
 * 
 * @param payload - The JWT payload containing userId, email, and role.
 * @returns The signed JWT string.
 */
export function signToken(payload: JWTPayload): string {
  return jwt.sign(payload, SECRET, { expiresIn: '24h' });
}

/**
 * Verifies and decodes a JWT token.
 * 
 * @param token - The JWT string to verify.
 * @returns The decoded JWTPayload.
 */
export function verifyToken(token: string): JWTPayload {
  return jwt.verify(token, SECRET) as unknown as JWTPayload;
}
