import type { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { ApiError } from '../lib/api-error';
import { logger } from '../lib/logger';

export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction,
): void {
  logger.error({
    err,
    message: err.message,
    path: req.originalUrl,
    method: req.method,
    ip: req.ip,
    requestId: req.requestId,
  }, 'API Error');

  let apiError: ApiError;

  if (ApiError.isApiError(err)) {
    apiError = err;
  } else if (err instanceof ZodError) {
    apiError = ApiError.fromZodError(err, req);
  } else if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    apiError = ApiError.unauthorized('Invalid or expired token');
  } else {
    const isProduction = process.env.NODE_ENV === 'production';
    apiError = new ApiError(
      500,
      'Internal Server Error',
      isProduction ? 'An unexpected error occurred' : err.message,
    );
  }

  const problem = apiError.toProblemDetails(req);
  // Add request ID to problem details for tracing
  if (req.requestId) {
    problem.requestId = req.requestId;
  }
  res.status(apiError.status).json(problem);
}