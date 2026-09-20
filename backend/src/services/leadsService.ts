import { LeadStatus, Role } from '@prisma/client';
import { prisma } from '../lib/prisma';
import { ApiError } from '../lib/api-error';
import { invalidatePattern, cacheKeys, cacheTTL, cachedQuery } from '../lib/cache';

export interface CreateLeadData {
  userId: string;
  name: string;
  phone: string;
  scoreId?: string;
  slot?: Date;
  otp?: string;
}

export interface LeadListParams {
  status?: LeadStatus;
  page: number;
  limit: number;
  cursor?: string;
  cursorId?: string;
}

export interface LeadListResult {
  leads: any[];
  total: number;
  page: number;
  limit: number;
  pages: number;
  nextCursor?: string;
  nextCursorId?: string;
}

export class LeadsService {
  async createLead(data: CreateLeadData): Promise<{ leadId: string }> {
    const lead = await prisma.lead.create({
      data: {
        userId: data.userId,
        name: data.name,
        phone: data.phone,
        scoreId: data.scoreId ?? null,
        slot: data.slot ?? null,
      },
    });

    await invalidatePattern('leads:list:');
    return { leadId: lead.id };
  }

  async getLeads(params: LeadListParams): Promise<LeadListResult> {
    const { status, page, limit, cursor, cursorId } = params;

    const where: Record<string, any> = {};
    if (status) {
      where.status = status;
    }

    let cursorFilter: Record<string, any> = {};
    if (cursor && cursorId) {
      cursorFilter = {
        OR: [
          { createdAt: { lt: new Date(cursor) } },
          { createdAt: new Date(cursor), id: { lt: cursorId } },
        ],
      };
    }

    const cacheKey = cacheKeys.leadsList({ status, page, limit, cursor, cursorId });

    const [leads, total] = await Promise.all([
      cachedQuery(
        cacheKey,
        async () => {
          return prisma.lead.findMany({
            where,
            select: {
              id: true,
              name: true,
              phone: true,
              scoreId: true,
              slot: true,
              status: true,
              notes: true,
              createdAt: true,
              user: {
                select: {
                  id: true,
                  email: true,
                  name: true,
                  phone: true,
                  role: true,
                },
              },
            },
            orderBy: { createdAt: 'desc' },
            skip: (page - 1) * limit,
            take: limit,
          });
        },
        { ttl: cacheTTL.short }
      ),
      prisma.lead.count({ where }),
    ]);

    const nextCursor = leads.length === limit && leads.length > 0
      ? leads[leads.length - 1].createdAt.toISOString()
      : undefined;
    const nextCursorId = leads.length === limit && leads.length > 0
      ? leads[leads.length - 1].id
      : undefined;

    return {
      leads,
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
      nextCursor,
      nextCursorId,
    };
  }

  async getLeadById(id: string, userId?: string, userRole?: Role) {
    const lead = await prisma.lead.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
      },
    });

    if (!lead) {
      throw ApiError.notFound('Lead not found');
    }

    if (userRole !== 'ADMIN' && userId && lead.userId !== userId) {
      throw ApiError.forbidden('Access denied');
    }

    return lead;
  }

  async updateLeadStatus(id: string, status: LeadStatus, notes?: string) {
    const existingLead = await prisma.lead.findUnique({
      where: { id },
    });

    if (!existingLead) {
      throw ApiError.notFound('Lead not found');
    }

    const updatedLead = await prisma.lead.update({
      where: { id },
      data: {
        status,
        notes: notes !== undefined ? notes : existingLead.notes,
      },
    });

    await invalidatePattern('leads:list:');
    return updatedLead;
  }

  async deleteLead(id: string, userId?: string, userRole?: Role) {
    const lead = await prisma.lead.findUnique({
      where: { id },
    });

    if (!lead) {
      throw ApiError.notFound('Lead not found');
    }

    if (userRole !== 'ADMIN' && userId && lead.userId !== userId) {
      throw ApiError.forbidden('Access denied');
    }

    await prisma.lead.delete({
      where: { id },
    });

    await invalidatePattern('leads:list:');
    return { message: 'Lead deleted successfully' };
  }

  async getUserBookings(userId: string) {
    return prisma.advisorySession.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getAvailability(): Promise<string[]> {
    return [];
  }

  async bookSession(userId: string, slots: { slot1: Date; slot2: Date; slot3: Date }) {
    const session = await prisma.advisorySession.create({
      data: {
        userId,
        preferredSlot1: slots.slot1,
        preferredSlot2: slots.slot2,
        preferredSlot3: slots.slot3,
        status: 'PENDING',
      },
    });

    await invalidatePattern(`leads:sessions:${userId}`);
    return session;
  }

  async bookSessionPublic(data: {
    name: string;
    phone: string;
    email: string;
    slot1: Date;
    slot2: Date;
    slot3: Date;
  }) {
    let user = await prisma.user.findFirst({ where: { email: data.email.toLowerCase() } });

    if (!user) {
      user = await prisma.user.create({
        data: {
          email: data.email.toLowerCase(),
          name: data.name,
          phone: data.phone,
          role: 'GUEST',
        },
      });
    }

    const session = await prisma.advisorySession.create({
      data: {
        userId: user.id,
        preferredSlot1: data.slot1,
        preferredSlot2: data.slot2,
        preferredSlot3: data.slot3,
        status: 'PENDING',
      },
    });

    await invalidatePattern('leads:admin:sessions');
    return session;
  }

  async getUserSessions(userId: string) {
    return prisma.advisorySession.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getAdminSessions() {
    return prisma.advisorySession.findMany({
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async confirmSession(id: string, confirmedSlot: Date, googleMeetLink: string) {
    return prisma.advisorySession.update({
      where: { id },
      data: {
        confirmedSlot,
        googleMeetLink,
        status: 'CONFIRMED',
      },
    });
  }

  async updateSessionNotes(id: string, notes?: string) {
    return prisma.advisorySession.update({
      where: { id },
      data: { notes },
    });
  }

  async refundSession(id: string) {
    return prisma.advisorySession.update({
      where: { id },
      data: { status: 'REFUNDED' },
    });
  }

  async deleteSession(id: string) {
    return prisma.advisorySession.delete({
      where: { id },
    });
  }
}

export const leadsService = new LeadsService();