import { PrismaClient, AuditAction, Prisma } from '@prisma/client';
import { logger } from '../lib/logger';

const prisma = new PrismaClient();

export interface AuditLogOptions {
  tableName: string;
  recordId: string;
  action: AuditAction;
  userId?: string;
  changes?: Record<string, { before: any; after: any }>;
  metadata?: Record<string, any>;
}

/**
 * Create an audit log entry
 */
export async function createAuditLog(options: AuditLogOptions): Promise<void> {
  try {
    await prisma.auditLog.create({
      data: {
        tableName: options.tableName,
        recordId: options.recordId,
        action: options.action,
        userId: options.userId,
        changes: options.changes ? (options.changes as Prisma.InputJsonValue) : Prisma.JsonNull,
        metadata: options.metadata ? (options.metadata as Prisma.InputJsonValue) : Prisma.JsonNull,
      },
    });
  } catch (error) {
    // Don't throw - audit logging should not break the main operation
    logger.error({ err: error }, 'Failed to create audit log');
  }
}

/**
 * Helper to create audit log for CREATE operations
 */
export async function auditCreate(
  tableName: string,
  recordId: string,
  userId: string | undefined,
  data: Record<string, any>,
  metadata?: Record<string, any>
): Promise<void> {
  await createAuditLog({
    tableName,
    recordId,
    action: 'CREATE',
    userId,
    changes: Object.fromEntries(
      Object.entries(data).map(([key, value]) => [key, { before: null, after: value }])
    ),
    metadata,
  });
}

/**
 * Helper to create audit log for UPDATE operations
 */
export async function auditUpdate(
  tableName: string,
  recordId: string,
  userId: string | undefined,
  before: Record<string, any>,
  after: Record<string, any>,
  metadata?: Record<string, any>
): Promise<void> {
  const allKeys = new Set([...Object.keys(before), ...Object.keys(after)]);
  const changes: Record<string, { before: any; after: any }> = {};

  for (const key of allKeys) {
    if (before[key] !== after[key]) {
      changes[key] = { before: before[key], after: after[key] };
    }
  }

  if (Object.keys(changes).length === 0) return;

  await createAuditLog({
    tableName,
    recordId,
    action: 'UPDATE',
    userId,
    changes,
    metadata,
  });
}

/**
 * Helper to create audit log for DELETE operations
 */
export async function auditDelete(
  tableName: string,
  recordId: string,
  userId: string | undefined,
  data: Record<string, any>,
  metadata?: Record<string, any>
): Promise<void> {
  await createAuditLog({
    tableName,
    recordId,
    action: 'DELETE',
    userId,
    changes: Object.fromEntries(
      Object.entries(data).map(([key, value]) => [key, { before: value, after: null }])
    ),
    metadata,
  });
}