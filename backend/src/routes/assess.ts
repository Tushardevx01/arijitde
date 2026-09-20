import { Router } from 'express';
import type { Response } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { authMiddleware } from '../middleware/auth';
import type { AuthenticatedRequest } from '../middleware/auth';
import { Goal } from '@prisma/client';
import { cachedQuery, cacheKeys, cacheTTL, invalidatePattern } from '../lib/cache';
import { ApiError } from '../lib/api-error';

const router = Router();

// POST /api/assess
const createAssessmentSchema = z.object({
  age: z
    .number()
    .int()
    .min(0, 'Age must be positive')
    .max(120, 'Age is too high'),
  goal: z.nativeEnum(Goal),
  ageRange: z.string().optional().nullable(),
  lifeStage: z.string().optional().nullable(),
  investmentTenure: z.string().optional().nullable(),
  isCompletePortfolio: z.boolean().optional().nullable(),
  investmentStyle: z.string().optional().nullable(),
  expectedReturn: z.string().optional().nullable(),
  riskBehavior: z.string().optional().nullable(),
  monthlyInvestment: z.string().optional().nullable(),
  emergencyFund: z.string().optional().nullable(),
});

router.post(
  '/',
  authMiddleware,
  async (req: AuthenticatedRequest, res: Response, next) => {
    try {
      const {
        age,
        goal,
        ageRange,
        lifeStage,
        investmentTenure,
        isCompletePortfolio,
        investmentStyle,
        expectedReturn,
        riskBehavior,
        monthlyInvestment,
        emergencyFund,
      } = createAssessmentSchema.parse(req.body);
      const userId = req.user!.id; // Guaranteed by authMiddleware

      const assessment = await prisma.assessment.create({
        data: {
          userId,
          age,
          goal,
          ageRange: ageRange ?? null,
          lifeStage: lifeStage ?? null,
          investmentTenure: investmentTenure ?? null,
          isCompletePortfolio: isCompletePortfolio ?? null,
          investmentStyle: investmentStyle ?? null,
          expectedReturn: expectedReturn ?? null,
          riskBehavior: riskBehavior ?? null,
          monthlyInvestment: monthlyInvestment ?? null,
          emergencyFund: emergencyFund ?? null,
        },
      });

      res.status(201).json({
        success: true,
        data: {
          assessmentId: assessment.id,
          age: assessment.age,
          goal: assessment.goal,
          ageRange: assessment.ageRange,
          lifeStage: assessment.lifeStage,
          investmentTenure: assessment.investmentTenure,
          isCompletePortfolio: assessment.isCompletePortfolio,
          investmentStyle: assessment.investmentStyle,
          expectedReturn: assessment.expectedReturn,
          riskBehavior: assessment.riskBehavior,
          monthlyInvestment: assessment.monthlyInvestment,
          emergencyFund: assessment.emergencyFund,
        },
      });
    } catch (error) {
      next(error);
    }
  },
);
// GET /api/assess
router.get(
  '/',
  authMiddleware,
  async (req: AuthenticatedRequest, res: Response, next) => {
    try {
      const userId = req.user!.id;
      const cacheKey = cacheKeys.userAssessment(userId);

      const data = await cachedQuery(
        cacheKey,
        async () => {
          return prisma.assessment.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
          });
        },
        { ttl: cacheTTL.medium }
      );

      res.json({
        success: true,
        data,
      });
    } catch (error) {
      next(error);
    }
  },
);

// GET /api/assess/:id
const getAssessmentParamsSchema = z.object({
  id: z.string().uuid('Invalid assessment ID format'),
});

router.get(
  '/:id',
  authMiddleware,
  async (req: AuthenticatedRequest, res: Response, next) => {
    try {
      const { id } = getAssessmentParamsSchema.parse(req.params);
      const userId = req.user!.id; // Guaranteed by authMiddleware

      const cacheKey = cacheKeys.assessmentDetail(id);

      const assessment = await cachedQuery(
        cacheKey,
        async () => {
          return prisma.assessment.findUnique({
            where: { id },
          });
        },
        { ttl: cacheTTL.medium }
      );

      if (!assessment) {
        return next(ApiError.notFound('Assessment not found'));
      }

      // Only return if assessment belongs to req.user.id
      if (assessment.userId !== userId) {
        return next(ApiError.forbidden('You do not own this assessment'));
      }

      res.json({
        success: true,
        data: assessment,
      });
    } catch (error) {
      next(error);
    }
  },
);

// GET /api/assess/user/:userId
router.get(
  '/user/:userId',
  authMiddleware,
  async (req: AuthenticatedRequest, res: Response, next) => {
    try {
      const { userId } = req.params as { userId: string };
      const cacheKey = cacheKeys.userAssessment(userId);

      const data = await cachedQuery(
        cacheKey,
        async () => {
          return prisma.assessment.findFirst({
            where: { userId },
            orderBy: { createdAt: 'desc' },
          });
        },
        { ttl: cacheTTL.medium }
      );

      res.json({
        success: true,
        data,
      });
    } catch (error) {
      next(error);
    }
  },
);

export default router;
