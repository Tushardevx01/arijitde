import { Router, Request, Response } from 'express';
import client, { Counter, Histogram, Gauge, Registry, collectDefaultMetrics } from 'prom-client';
import { authMiddleware } from '../middleware/auth';
import { adminMiddleware } from '../middleware/admin';
import { ApiError } from '../lib/api-error';

const router = Router();

// Create a Registry to register the metrics
const register = new Registry();

// Add default metrics (CPU, memory, etc.)
collectDefaultMetrics({ register });

// Custom metrics
const httpRequestDuration = new Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.01, 0.05, 0.1, 0.5, 1, 2, 5, 10],
  registers: [register],
});

const httpRequestsTotal = new Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code'],
  registers: [register],
});

const activeUsers = new Gauge({
  name: 'active_users',
  help: 'Number of active users',
  registers: [register],
});

const dbQueryDuration = new Histogram({
  name: 'db_query_duration_seconds',
  help: 'Duration of database queries in seconds',
  labelNames: ['operation', 'table'],
  buckets: [0.001, 0.005, 0.01, 0.05, 0.1, 0.5, 1, 2],
  registers: [register],
});

const cacheHits = new Counter({
  name: 'cache_hits_total',
  help: 'Total number of cache hits',
  labelNames: ['cache_type'],
  registers: [register],
});

const cacheMisses = new Counter({
  name: 'cache_misses_total',
  help: 'Total number of cache misses',
  labelNames: ['cache_type'],
  registers: [register],
});

const businessMetrics = {
  leadsCreated: new Counter({
    name: 'leads_created_total',
    help: 'Total number of leads created',
    registers: [register],
  }),
  assessmentsCompleted: new Counter({
    name: 'assessments_completed_total',
    help: 'Total number of assessments completed',
    registers: [register],
  }),
  portfoliosCreated: new Counter({
    name: 'portfolios_created_total',
    help: 'Total number of portfolios created',
    registers: [register],
  }),
  sessionsBooked: new Counter({
    name: 'sessions_booked_total',
    help: 'Total number of advisory sessions booked',
    registers: [register],
  }),
  paymentsProcessed: new Counter({
    name: 'payments_processed_total',
    help: 'Total number of payments processed',
    registers: [register],
  }),
};

// Middleware to track HTTP metrics
export function metricsMiddleware(req: Request, res: Response, next: Function) {
  const start = Date.now();

  // Track response
  res.on('finish', () => {
    const duration = (Date.now() - start) / 1000;
    const route = req.route?.path || req.path;
    const statusCode = res.statusCode.toString();

    httpRequestDuration.observe({ method: req.method, route, status_code: statusCode }, duration);
    httpRequestsTotal.inc({ method: req.method, route, status_code: statusCode });
  });

  next();
}

// Helper functions to increment business metrics
export const incrementLeadsCreated = () => businessMetrics.leadsCreated.inc();
export const incrementAssessmentsCompleted = () => businessMetrics.assessmentsCompleted.inc();
export const incrementPortfoliosCreated = () => businessMetrics.portfoliosCreated.inc();
export const incrementSessionsBooked = () => businessMetrics.sessionsBooked.inc();
export const incrementPaymentsProcessed = () => businessMetrics.paymentsProcessed.inc();

export const incrementCacheHit = (cacheType: string) => cacheHits.inc({ cache_type: cacheType });
export const incrementCacheMiss = (cacheType: string) => cacheMisses.inc({ cache_type: cacheType });

export const observeDbQuery = (operation: string, table: string, durationMs: number) => {
  dbQueryDuration.observe({ operation, table }, durationMs / 1000);
};

export const setActiveUsers = (count: number) => activeUsers.set(count);

// GET /api/metrics - Prometheus metrics endpoint
router.get(
  '/metrics',
  authMiddleware,
  adminMiddleware,
  async (req: Request, res: Response, next: Function) => {
    try {
      res.set('Content-Type', register.contentType);
      const metrics = await register.metrics();
      res.send(metrics);
    } catch (error) {
      next(error);
    }
  }
);

// GET /api/metrics/health - Health check for metrics endpoint
router.get(
  '/metrics/health',
  (req: Request, res: Response) => {
    res.json({
      success: true,
      data: {
        status: 'healthy',
        timestamp: new Date().toISOString(),
      },
    });
  }
);

export default router;