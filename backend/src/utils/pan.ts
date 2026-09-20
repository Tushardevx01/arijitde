import { PrismaClient } from '@prisma/client';
import { prisma } from '../lib/prisma';
import jwt from 'jsonwebtoken';
import { ApiError } from '../lib/api-error';

const PAN_VERIFICATION_SECRET: string = process.env.PAN_VERIFICATION_SECRET || process.env.JWT_SECRET || '';
if (!PAN_VERIFICATION_SECRET) {
  throw new Error('PAN_VERIFICATION_SECRET or JWT_SECRET environment variable is required for PAN verification tokens.');
}

export interface ClientAccountInfo {
  id: string;
  name: string;
  panMasked: string;
}

export interface PanVerificationResult {
  accounts: ClientAccountInfo[];
  tempToken: string;
  email: string;
}

/**
 * Find client accounts by email (case insensitive)
 * Returns masked PAN info for account selection
 */
export async function findClientAccountsByEmail(
  email: string,
  prismaClient: PrismaClient = prisma
): Promise<ClientAccountInfo[]> {
  const formattedEmail = email.toLowerCase();
  const clientRecords = await prismaClient.existingClient.findMany({
    where: { email: { equals: email, mode: 'insensitive' } },
  });

  return clientRecords.map((c: any) => {
    const pan = c.pan || '';
    const panMasked =
      pan.length >= 4
        ? '*'.repeat(pan.length - 4) + pan.substring(pan.length - 4)
        : 'N/A';
    return { id: c.id, name: c.name || 'N/A', panMasked };
  });
}

/**
 * Verify PAN matches the client record
 * Returns client record if PAN matches, throws ApiError if not
 */
export async function verifyPanMatchesClientRecord(
  accountId: string,
  pan: string,
  email: string,
  prismaClient: PrismaClient = prisma
) {
  const formattedEmail = email.toLowerCase();
  const formattedPan = pan.trim().toUpperCase();

  const clientRecord = await prismaClient.existingClient.findUnique({
    where: { id: accountId },
  });

  if (!clientRecord) {
    throw new ApiError(404, 'Not Found', 'Client account not found.');
  }

  if ((clientRecord.email || '').toLowerCase() !== email.toLowerCase()) {
    throw new ApiError(400, 'Bad Request', 'This account does not belong to the verified email address.');
  }

  const recordPan = (clientRecord.pan || '').trim().toUpperCase();
  if (recordPan !== formattedPan) {
    throw new ApiError(400, 'Bad Request', 'Incorrect PAN number. Please try again.');
  }

  return clientRecord;
}

/**
 * Generate masked PAN for display
 */
export function maskPan(pan: string): string {
  if (!pan) return 'N/A';
  return pan.length >= 4
    ? '*'.repeat(pan.length - 4) + pan.substring(pan.length - 4)
    : 'N/A';
}

/**
 * Generate accounts list with masked PANs for client selection UI
 */
export async function getClientAccountsForSelection(
  email: string,
  prismaClient: PrismaClient = prisma
): Promise<{ accounts: ClientAccountInfo[]; tempToken: string; email: string }> {
  const accounts = await findClientAccountsByEmail(email, prismaClient);
  
  const tempToken = jwt.sign(
    { email, purpose: 'client_pan_verification' },
    PAN_VERIFICATION_SECRET,
    { expiresIn: '15m' }
  );

  return { accounts, tempToken, email };
}