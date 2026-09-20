import pino from 'pino';
import { randomUUID } from 'crypto';

const isProduction = process.env.NODE_ENV === 'production';

const pinoLogger = pino({
  level: process.env.LOG_LEVEL || (isProduction ? 'info' : 'debug'),
  transport: isProduction
    ? undefined
    : {
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'SYS:standard',
          ignore: 'pid,hostname',
        },
      },
  base: {
    service: 'finanalysis-api',
    environment: process.env.NODE_ENV || 'development',
  },
  formatters: {
    level: (label) => {
      return { level: label };
    },
  },
  timestamp: pino.stdTimeFunctions.isoTime,
  mixin: () => ({
    requestId: (global as any).currentRequestId || undefined,
  }),
});

export const logger = pinoLogger;

export function createChildLogger(bindings: Record<string, unknown>) {
  return logger.child(bindings);
}

export function setRequestId(requestId: string) {
  (global as any).currentRequestId = requestId;
}

export function clearRequestId() {
  (global as any).currentRequestId = undefined;
}