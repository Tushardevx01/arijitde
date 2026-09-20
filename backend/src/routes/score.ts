import { Router } from 'express';
import type { Response } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { authMiddleware } from '../middleware/auth';
import type { AuthenticatedRequest } from '../middleware/auth';
import { calculateScore } from '../services/scoring';
import { cachedQuery, cacheKeys, cacheTTL, invalidatePattern } from '../lib/cache';
import { ApiError } from '../lib/api-error';

const router = Router();

const scoreParamsSchema = z.object({
  portfolioId: z.string().uuid('Invalid portfolio ID format'),
});

// 1. POST /api/score/:portfolioId
router.post(
  '/:portfolioId',
  authMiddleware,
  async (req: AuthenticatedRequest, res: Response, next) => {
    try {
      const { portfolioId } = scoreParamsSchema.parse(req.params);

      // Fetch portfolio, rows, and assessment
      const portfolio = await prisma.portfolio.findUnique({
        where: { id: portfolioId },
        include: {
          rows: true,
          assessment: true,
        },
      });

      if (!portfolio) {
        return next(ApiError.notFound('Portfolio not found'));
      }

      // Verify ownership
      if (portfolio.userId !== req.user!.id) {
        return next(ApiError.forbidden('You do not own this portfolio'));
      }

      // Run scoring engine (async due to AMFI API calls in efficiency)
      const scoreResult = await calculateScore(
        portfolio.rows,
        portfolio.assessment,
      );

      // Save Score to DB (upsert since portfolioId is unique)
      const score = await prisma.score.upsert({
        where: { portfolioId: portfolio.id },
        update: {
          total: scoreResult.total,
          goalAlignment: scoreResult.goalAlignment,
          assetAlloc: scoreResult.assetAlloc,
          diversification: scoreResult.diversification,
          discipline: scoreResult.discipline,
          efficiency: scoreResult.efficiency,
          tag: scoreResult.tag,
          insights: scoreResult.insights,
        },
        create: {
          portfolioId: portfolio.id,
          total: scoreResult.total,
          goalAlignment: scoreResult.goalAlignment,
          assetAlloc: scoreResult.assetAlloc,
          diversification: scoreResult.diversification,
          discipline: scoreResult.discipline,
          efficiency: scoreResult.efficiency,
          tag: scoreResult.tag,
          insights: scoreResult.insights,
        },
      });

      // Invalidate score cache
      await invalidatePattern('score:portfolio:');

      res.json({
        success: true,
        data: score,
      });
    } catch (error) {
      next(error);
    }
  },
);

// 2. GET /api/score/:id
const getScoreParamsSchema = z.object({
  id: z.string().uuid('Invalid score ID format'),
});

router.get(
  '/:id',
  authMiddleware,
  async (req: AuthenticatedRequest, res: Response, next) => {
    try {
      const { id } = getScoreParamsSchema.parse(req.params);

      const cacheKey = cacheKeys.portfolioScores(id);

      const score = await cachedQuery(
        cacheKey,
        async () => {
          return prisma.score.findUnique({
            where: { id },
            include: {
              portfolio: true,
            },
          });
        },
        { ttl: cacheTTL.medium }
      );

      if (!score) {
        return next(ApiError.notFound('Score not found'));
      }

      // Verify ownership via portfolio
      if (score.portfolio.userId !== req.user!.id) {
        return next(ApiError.forbidden('You do not own this score'));
      }

      res.json({
        success: true,
        data: score,
      });
    } catch (error) {
      next(error);
    }
  },
);

export default router;
