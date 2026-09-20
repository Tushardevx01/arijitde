import type { Request } from 'express';
import { ZodError } from 'zod';

export interface ProblemDetails {
  type: string;
  title: string;
  status: number;
  detail: string;
  instance: string;
  requestId?: string;
  [key: string]: unknown;
}

export class ApiError extends Error {
  public readonly status: number;
  public readonly type: string;
  public readonly title: string;
  public readonly detail: string;
  public readonly instance: string;
  public readonly extensions: Record<string, unknown>;

  constructor(
    status: number,
    title: string,
    detail: string,
    type?: string,
    extensions?: Record<string, unknown>
  ) {
    super(detail);
    this.name = 'ApiError';
    this.status = status;
    this.type = type || `https://httpstatuses.com/${status}`;
    this.title = title;
    this.detail = detail;
    this.instance = '';
    this.extensions = extensions || {};
  }

  toProblemDetails(req?: Request): ProblemDetails {
    return {
      type: this.type,
      title: this.title,
      status: this.status,
      detail: this.detail,
      instance: req?.originalUrl || this.instance || '',
      ...this.extensions,
    };
  }

  static badRequest(detail: string, extensions?: Record<string, unknown>): ApiError {
    return new ApiError(400, 'Bad Request', detail, undefined, extensions);
  }

  static unauthorized(detail: string, extensions?: Record<string, unknown>): ApiError {
    return new ApiError(401, 'Unauthorized', detail, undefined, extensions);
  }

  static forbidden(detail: string, extensions?: Record<string, unknown>): ApiError {
    return new ApiError(403, 'Forbidden', detail, undefined, extensions);
  }

  static notFound(detail: string, extensions?: Record<string, unknown>): ApiError {
    return new ApiError(404, 'Not Found', detail, undefined, extensions);
  }

  static conflict(detail: string, extensions?: Record<string, unknown>): ApiError {
    return new ApiError(409, 'Conflict', detail, undefined, extensions);
  }

  static tooManyRequests(detail: string, extensions?: Record<string, unknown>): ApiError {
    return new ApiError(429, 'Too Many Requests', detail, undefined, extensions);
  }

  static internal(detail: string, extensions?: Record<string, unknown>): ApiError {
    return new ApiError(500, 'Internal Server Error', detail, undefined, extensions);
  }

  static fromZodError(err: ZodError, req?: Request): ApiError {
    const messages = err.issues
      .map((e) => `${e.path.join('.')}: ${e.message}`)
      .join('; ');
    const extensions = {
      errors: err.issues.map((e) => ({
        field: e.path.join('.'),
        message: e.message,
        code: e.code,
      })),
    };
    return new ApiError(400, 'Validation Error', messages, undefined, extensions);
  }

  static isApiError(err: unknown): err is ApiError {
    return err instanceof ApiError;
  }
}