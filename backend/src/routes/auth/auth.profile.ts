import { Router } from 'express';
import type { Response, Request } from 'express';
import { z } from 'zod';
import { prisma } from '../../lib/prisma';
import { authMiddleware } from '../../middleware/auth';
import type { AuthenticatedRequest } from '../../middleware/auth';
import { ApiError } from '../../lib/api-error';
import { generateUniqueReferralCode } from '../../utils/auth';

const router = Router();

// GET /api/auth/me
router.get('/me', authMiddleware, async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const userId = req.user!.id;
    let user = req.user!;

    if (!user.referralCode) {
      const refCode = await generateUniqueReferralCode();
      user = (await prisma.user.update({
        where: { id: userId },
        data: { referralCode: refCode },
        include: { client: { select: { activePlan: true, advisorNotes: true, activatedAt: true } } },
      })) as any;
    }

    res.json({ success: true, data: user });
  } catch (error) { next(error); }
});

// POST /api/auth/phone
const updatePhoneSchema = z.object({
  phone: z.string().min(10, 'Phone number must be at least 10 digits'),
  dob: z.string().refine((val) => !isNaN(Date.parse(val)), { message: 'Invalid date of birth format' }).transform((val) => new Date(val)),
  anniversary: z.string().optional().nullable().refine((val) => !val || val.trim() === '' || !isNaN(Date.parse(val)), { message: 'Invalid anniversary date format' }).transform((val) => (val && val.trim() !== '' ? new Date(val) : null)),
});

router.post('/phone', authMiddleware, async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const { phone, dob, anniversary } = updatePhoneSchema.parse(req.body);
    const userId = req.user!.id;

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { phone, dob, anniversary },
      select: { id: true, email: true, name: true, role: true, phone: true, dob: true, anniversary: true },
    });

    res.json({ success: true, data: updatedUser });
  } catch (error) { next(error); }
});

export default router;