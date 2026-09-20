import * as Sentry from '@sentry/node';
import { nodeProfilingIntegration } from '@sentry/profiling-node';
import { expressErrorHandler } from '@sentry/node';

export function initSentry(): void {
  const dsn = process.env.SENTRY_DSN;
  const environment = process.env.NODE_ENV || 'development';

  if (!dsn) {
    console.warn('SENTRY_DSN not configured, skipping Sentry initialization');
    return;
  }

  Sentry.init({
    dsn,
    environment,
    integrations: [
      nodeProfilingIntegration(),
    ],
    tracesSampleRate: 0.1, // 10% of transactions for performance monitoring
    profilesSampleRate: 0.1, // 10% of profiles for profiling
    // Filter out health check requests
    ignoreErrors: [
      'Route not found',
      'Access token is missing or invalid',
      'Access token has expired',
      'Token is invalid',
    ],
    beforeSend(event, hint) {
      // Filter out development errors
      if (environment === 'development') {
        console.log('Sentry event (dev):', hint.originalException);
        return null;
      }
      return event;
    },
  });

  console.log('Sentry initialized for environment:', environment);
}

// Express error handler for Sentry (uses the expressErrorHandler from @sentry/node)
export const sentryErrorHandler = Sentry.expressErrorHandler({
  shouldHandleError(error: Error) {
    // Capture all errors 500 and above
    return error instanceof Error;
  },
});

export default Sentry;