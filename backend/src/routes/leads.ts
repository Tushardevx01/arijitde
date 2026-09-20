import { Router } from 'express';
import type { Request, Response } from 'express';
import { z } from 'zod';
import { authMiddleware } from '../middleware/auth';
import type { AuthenticatedRequest } from '../middleware/auth';
import { adminMiddleware } from '../middleware/admin';
import { sendOTPEmail } from '../services/email';
import { LeadStatus } from '@prisma/client';
import { invalidatePattern } from '../lib/cache';
import { ApiError } from '../lib/api-error';
import { logger } from '../lib/logger';
import { leadsService } from '../services/leadsService';

const router = Router();

// Zod validation schemas
const createLeadSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  phone: z.string().min(5, 'Phone number must be at least 5 characters'),
  scoreId: z.string().uuid().optional(),
  slot: z.preprocess((arg) => {
    if (typeof arg === 'string' && arg.trim() !== '') {
      const date = new Date(arg);
      return isNaN(date.getTime()) ? undefined : date;
    }
    if (arg instanceof Date) return arg;
    return undefined;
  }, z.date().optional()),
  otp: z.string().optional(), // Add otp field for email
});

const getLeadsQuerySchema = z.object({
  status: z.nativeEnum(LeadStatus).optional(),
  page: z
    .preprocess((val) => Number(val || 1), z.number().int().positive())
    .default(1),
  limit: z
    .preprocess((val) => Number(val || 10), z.number().int().positive())
    .default(10),
  cursor: z.string().optional(),
  cursorId: z.string().optional(),
});

const updateLeadStatusSchema = z.object({
  status: z.nativeEnum(LeadStatus),
  notes: z.string().optional(),
});

const bookSessionSchema = z.object({
  slot1: z
    .string()
    .refine((val) => !isNaN(Date.parse(val)), {
      message: 'Invalid slot 1 format',
    })
    .transform((val) => new Date(val)),
  slot2: z
    .string()
    .refine((val) => !isNaN(Date.parse(val)), {
      message: 'Invalid slot 2 format',
    })
    .transform((val) => new Date(val)),
  slot3: z
    .string()
    .refine((val) => !isNaN(Date.parse(val)), {
      message: 'Invalid slot 3 format',
    })
    .transform((val) => new Date(val)),
});

const bookSessionPublicSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  phone: z.string().min(5, 'Phone number must be at least 5 characters'),
  email: z.string().email('Invalid email address'),
  slot1: z
    .string()
    .refine((val) => !isNaN(Date.parse(val)), {
      message: 'Invalid slot 1 format',
    })
    .transform((val) => new Date(val)),
  slot2: z
    .string()
    .refine((val) => !isNaN(Date.parse(val)), {
      message: 'Invalid slot 2 format',
    })
    .transform((val) => new Date(val)),
  slot3: z
    .string()
    .refine((val) => !isNaN(Date.parse(val)), {
      message: 'Invalid slot 3 format',
    })
    .transform((val) => new Date(val)),
});

const adminConfirmSessionSchema = z.object({
  confirmedSlot: z
    .string()
    .refine((val) => !isNaN(Date.parse(val)), {
      message: 'Invalid confirmed slot format',
    })
    .transform((val) => new Date(val)),
  googleMeetLink: z.string().url('Invalid Google Meet URL format'),
});

const adminUpdateNotesSchema = z.object({
  notes: z.string().optional(),
});

// 1. POST /api/leads
router.post(
  '/',
  authMiddleware,
  async (req: AuthenticatedRequest, res: Response, next) => {
    try {
      const validated = createLeadSchema.parse(req.body);
      const userId = req.user!.id;

      // Create lead record using service
      const result = await leadsService.createLead({
        userId,
        name: validated.name,
        phone: validated.phone,
        scoreId: validated.scoreId,
        slot: validated.slot,
      });

      if (req.user!.role === 'CLIENT') {
        const bookingSlot =
          validated.slot ||
          new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
        await leadsService.bookSession(userId, {
          slot1: new Date(bookingSlot),
          slot2: new Date(bookingSlot),
          slot3: new Date(bookingSlot),
        });
      }

      // Fire and forget email sending
      const email = req.user!.email;
      if (email) {
        const emailPromise = sendOTPEmail(
          email,
          (validated.otp || '') as string,
        );
        emailPromise.catch((err) =>
          logger.error({ err }, 'Failed to send advisory booking confirmation email in background'),
        );
      }

      res.status(201).json({
        success: true,
        data: { leadId: result.leadId },
      });
    } catch (error) {
      next(error);
    }
  },
);

// 2. GET /api/leads (admin only)
router.get(
  '/',
  authMiddleware,
  adminMiddleware,
  async (req: AuthenticatedRequest, res: Response, next) => {
    try {
      const { status, page, limit, cursor, cursorId } =
        getLeadsQuerySchema.parse(req.query);

      const result = await leadsService.getLeads({
        status,
        page,
        limit,
        cursor,
        cursorId,
      });

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },
);

// 3. PUT /api/leads/:id/status (admin only)
router.put(
  '/:id/status',
  authMiddleware,
  adminMiddleware,
  async (req: AuthenticatedRequest, res: Response, next) => {
    try {
      const { id } = z
        .object({ id: z.string().uuid('Invalid lead ID format') })
        .parse(req.params);
      const { status, notes } = updateLeadStatusSchema.parse(req.body);

      const updatedLead = await leadsService.updateLeadStatus(id, status, notes);

      res.json({
        success: true,
        data: updatedLead,
      });
    } catch (error) {
      next(error);
    }
  },
);



// 6. GET /api/leads/my-bookings (user)
router.get(
  '/my-bookings',
  authMiddleware,
  async (req: AuthenticatedRequest, res: Response, next) => {
    try {
      const bookings = await leadsService.getUserBookings(req.user!.id);
      res.json({
        success: true,
        data: bookings,
      });
    } catch (error) {
      next(error);
    }
  },
);

// 7. GET /api/leads/availability (user)
router.get(
  '/availability',
  authMiddleware,
  async (req: AuthenticatedRequest, res: Response, next) => {
    try {
      const slots = await leadsService.getAvailability();
      res.json({
        success: true,
        data: slots,
      });
    } catch (error) {
      next(error);
    }
  },
);

// 8. POST /api/leads/book-session (authenticated user)
router.post(
  '/book-session',
  authMiddleware,
  async (req: AuthenticatedRequest, res: Response, next) => {
    try {
      const validated = bookSessionSchema.parse(req.body);

      const session = await leadsService.bookSession(req.user!.id, {
        slot1: validated.slot1,
        slot2: validated.slot2,
        slot3: validated.slot3,
      });

      res.json({
        success: true,
        data: session,
      });
    } catch (error) {
      next(error);
    }
  },
);

// 9. POST /api/leads/book-session-public (public)
router.post(
  '/book-session-public',
  async (req: Request, res: Response, next) => {
    try {
      const validated = bookSessionPublicSchema.parse(req.body);

      const session = await leadsService.bookSessionPublic({
        name: validated.name,
        phone: validated.phone,
        email: validated.email,
        slot1: validated.slot1,
        slot2: validated.slot2,
        slot3: validated.slot3,
      });

      res.json({
        success: true,
        data: session,
      });
    } catch (error) {
      next(error);
    }
  },
);

// 10. GET /api/leads/my-sessions (user)
router.get(
  '/my-sessions',
  authMiddleware,
  async (req: AuthenticatedRequest, res: Response, next) => {
    try {
      const sessions = await leadsService.getUserSessions(req.user!.id);
      res.json({
        success: true,
        data: sessions,
      });
    } catch (error) {
      next(error);
    }
  },
);

// 11. GET /api/leads/admin/sessions (admin only)
router.get(
  '/admin/sessions',
  authMiddleware,
  adminMiddleware,
  async (req: AuthenticatedRequest, res: Response, next) => {
    try {
      const sessions = await leadsService.getAdminSessions();
      res.json({
        success: true,
        data: sessions,
      });
    } catch (error) {
      next(error);
    }
  },
);

// 12. POST /api/leads/admin/sessions/:id/confirm (admin only)
router.post(
  '/admin/sessions/:id/confirm',
  authMiddleware,
  adminMiddleware,
  async (req: AuthenticatedRequest, res: Response, next) => {
    try {
      const { id } = z
        .object({ id: z.string().uuid('Invalid session ID format') })
        .parse(req.params);
      const { confirmedSlot, googleMeetLink } = adminConfirmSessionSchema.parse(req.body);

      const session = await leadsService.confirmSession(id, confirmedSlot, googleMeetLink);

      res.json({
        success: true,
        data: session,
      });
    } catch (error) {
      next(error);
    }
  },
);

// 13. POST /api/leads/admin/sessions/:id/notes (admin only)
router.post(
  '/admin/sessions/:id/notes',
  authMiddleware,
  adminMiddleware,
  async (req: AuthenticatedRequest, res: Response, next) => {
    try {
      const { id } = z
        .object({ id: z.string().uuid('Invalid session ID format') })
        .parse(req.params);
      const { notes } = adminUpdateNotesSchema.parse(req.body);

      const session = await leadsService.updateSessionNotes(id, notes);

      res.json({
        success: true,
        data: session,
      });
    } catch (error) {
      next(error);
    }
  },
);

// 14. POST /api/leads/admin/sessions/:id/refund (admin only)
router.post(
  '/admin/sessions/:id/refund',
  authMiddleware,
  adminMiddleware,
  async (req: AuthenticatedRequest, res: Response, next) => {
    try {
      const { id } = z
        .object({ id: z.string().uuid('Invalid session ID format') })
        .parse(req.params);

      await leadsService.refundSession(id);

      res.json({
        success: true,
        message: 'Session refunded successfully',
      });
    } catch (error) {
      next(error);
    }
  },
);

// 15. DELETE /api/leads/admin/sessions/:id (admin only)
router.delete(
  '/admin/sessions/:id',
  authMiddleware,
  adminMiddleware,
  async (req: AuthenticatedRequest, res: Response, next) => {
    try {
      const { id } = z
        .object({ id: z.string().uuid('Invalid session ID format') })
        .parse(req.params);

      await leadsService.deleteSession(id);

      res.json({
        success: true,
        message: 'Session deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  },
);

// GET /api/leads/:id (user or admin) - Parameterized route placed after all static routes
router.get(
  '/:id',
  authMiddleware,
  async (req: AuthenticatedRequest, res: Response, next) => {
    try {
      const { id } = z
        .object({ id: z.string().uuid('Invalid lead ID format') })
        .parse(req.params);

      const lead = await leadsService.getLeadById(
        id,
        req.user!.id,
        req.user!.role,
      );

      res.json({
        success: true,
        data: lead,
      });
    } catch (error) {
      next(error);
    }
  },
);

// DELETE /api/leads/:id (user or admin) - Parameterized route placed after all static routes
router.delete(
  '/:id',
  authMiddleware,
  async (req: AuthenticatedRequest, res: Response, next) => {
    try {
      const { id } = z
        .object({ id: z.string().uuid('Invalid lead ID format') })
        .parse(req.params);

      await leadsService.deleteLead(id, req.user!.id, req.user!.role);

      res.json({
        success: true,
        message: 'Lead deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  },
);

export default router;