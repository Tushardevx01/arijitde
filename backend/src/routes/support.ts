import { Router } from 'express';
import type { Response } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { authMiddleware } from '../middleware/auth';
import type { AuthenticatedRequest } from '../middleware/auth';
import { ApiError } from '../lib/api-error';
import { sendSupportQueryNotificationEmail } from '../services/email';
import { logger } from '../lib/logger';

const router = Router(); // support query router

const querySchema = z.object({
  subject: z.string().min(1, 'Subject is required').max(150),
  message: z.string().min(1, 'Message is required').max(2000),
});

// 1. POST /api/support/query
router.post(
  '/query',
  authMiddleware,
  async (req: AuthenticatedRequest, res: Response, next) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return next(ApiError.unauthorized('Unauthorized'));
      }

      const body = querySchema.parse(req.body);

      const supportQuery = await prisma.supportQuery.create({
        data: {
          userId,
          subject: body.subject,
          message: body.message,
        },
      });

      // Send notification email to admin
      await sendSupportQueryNotificationEmail({
        name: req.user?.name || 'Unknown',
        email: req.user?.email || 'unknown',
        subject: body.subject,
        message: body.message,
      }).catch((err) => {
        logger.error({ err }, 'Failed to send support query notification email');
      });

      res.status(201).json({
        success: true,
        message: 'Support query submitted successfully',
        data: supportQuery,
      });
    } catch (error) {
      next(error);
    }
  },
);

// 2. GET /api/support/my-queries
router.get(
  '/my-queries',
  authMiddleware,
  async (req: AuthenticatedRequest, res: Response, next) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return next(ApiError.unauthorized('Unauthorized'));
      }

      const queries = await prisma.supportQuery.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
      });

      res.json({
        success: true,
        data: queries,
      });
    } catch (error) {
      next(error);
    }
  },
);

export default router;
