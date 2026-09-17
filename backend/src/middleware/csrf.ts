import crypto from 'crypto';
import type { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../lib/jwt';

const CSRF_COOKIE = 'csrf_token';
const CSRF_HEADER = 'x-csrf-token';
const SAFE_METHODS = ['GET', 'HEAD', 'OPTIONS'];

function generateToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

export function csrfMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  if (SAFE_METHODS.includes(req.method)) {
    // Set a new CSRF token in a cookie for safe methods
    if (!req.cookies?.[CSRF_COOKIE]) {
      const token = generateToken();
      res.cookie(CSRF_COOKIE, token, {
        httpOnly: false, // Must be readable by JS
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 24 * 60 * 60 * 1000, // 1 day
      });
    }
    return next();
  }

  // Exempt requests with a VALID Bearer token (authenticated API clients)
  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith('Bearer ')) {
    // Any Bearer-authenticated request is immune to CSRF (custom headers
    // cannot be forged cross-site); let the auth middleware classify
    // invalid/expired tokens with a proper 401 instead of a CSRF error.
    return next();
  }

  // Validate double-submit cookie
  const cookieToken = req.cookies?.[CSRF_COOKIE];
  const headerToken = req.headers[CSRF_HEADER] as string | undefined;

  if (!cookieToken || !headerToken || cookieToken !== headerToken) {
    res.status(403).json({
      success: false,
      error: 'Invalid or missing CSRF token',
    });
    return;
  }

  next();
}
