import { Request, Response, NextFunction } from 'express';
import { randomUUID } from 'crypto';
import { setRequestId, clearRequestId } from '../lib/logger';

declare global {
  namespace Express {
    interface Request {
      requestId: string;
    }
  }
}

const REQUEST_ID_HEADER = 'x-request-id';

export function requestIdMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  const requestId = req.headers['x-request-id'] as string || randomUUID();
  
  req.requestId = requestId;
  res.setHeader('x-request-id', requestId);
  
  // Set request ID for logger
  setRequestId(requestId);
  
  // Clear request ID after response finishes
  res.on('finish', () => {
    clearRequestId();
  });
  
  next();
}