import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { verifyAccessToken } from '../lib/jwt';
import { prisma } from '../lib/prisma';
import { Role } from '@prisma/client';
import { ApiError } from '../lib/api-error';
import { redis, isRedisAvailable } from '../lib/redis';

const USER_CACHE_TTL = 30; // 30 seconds
const USER_CACHE_PREFIX = 'user:';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string | null;
    name: string | null;
    role: Role;
    phone: string | null;
    pan: string | null;
    dob: Date | null;
    anniversary: Date | null;
    createdAt: Date;
    referralCode: string | null;
    referrerId: string | null;
    client?: {
      activePlan: string | null;
      advisorNotes: string | null;
      activatedAt: Date;
    } | null;
  };
}

async function getUserFromCache(userId: string) {
  if (!isRedisAvailable()) return null;
  try {
    const key: string = `${USER_CACHE_PREFIX}${userId}`;
    const cached = await redis!.get(key);
    if (cached === null || cached === undefined) return null;
    return JSON.parse(String(cached));
  } catch {
    return null;
  }
}

async function setUserCache(userId: string, user: any) {
  if (!isRedisAvailable()) return;
  try {
    const key: string = `${USER_CACHE_PREFIX}${userId}`;
    await redis!.set(key, JSON.stringify(user), { ex: USER_CACHE_TTL });
  } catch {
    // Ignore cache errors
  }
}

export async function authMiddleware(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(ApiError.unauthorized('Access token is missing or invalid'));
  }

  const token = authHeader.substring(7); // Remove 'Bearer ' prefix
  if (!token) {
    return next(ApiError.unauthorized('Access token is empty'));
  }

  try {
    const decoded = verifyAccessToken(token);
    
    // Try to get user from cache first
    let user = await getUserFromCache(decoded.userId);
    
    if (!user) {
      // Cache miss - fetch from database
      user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          phone: true,
          pan: true,
          dob: true,
          anniversary: true,
          createdAt: true,
          referralCode: true,
          referrerId: true,
          client: {
            select: {
              activePlan: true,
              advisorNotes: true,
              activatedAt: true,
            },
          },
        },
      });
      
      if (user) {
        // Store in cache for next request
        await setUserCache(decoded.userId, user);
      }
    }

    if (!user) {
      return next(ApiError.unauthorized('User does not exist'));
    }

    // Attach user to the request object
    req.user = user;
    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return next(ApiError.unauthorized('Access token has expired', { code: 'TOKEN_EXPIRED' }));
    }
    return next(ApiError.unauthorized('Token is invalid'));
  }
}

export async function optionalAuthMiddleware(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next();
  }

  const token = authHeader.substring(7);
  if (!token) {
    return next();
  }

  try {
    const decoded = verifyAccessToken(token);
    
    // Try to get user from cache first
    let user = await getUserFromCache(decoded.userId);
    
    if (!user) {
      // Cache miss - fetch from database
      user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          phone: true,
          pan: true,
          dob: true,
          anniversary: true,
          createdAt: true,
          referralCode: true,
          referrerId: true,
          client: {
            select: {
              activePlan: true,
              advisorNotes: true,
              activatedAt: true,
            },
          },
        },
      });
      
      if (user) {
        // Store in cache for next request
        await setUserCache(decoded.userId, user);
      }
    }

    if (user) {
      req.user = user;
    }
  } catch (error) {
    // Ignore invalid/expired token for optional auth, allowing public visitor to proceed
  }

  next();
}