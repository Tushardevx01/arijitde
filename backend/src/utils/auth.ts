import { prisma } from '../lib/prisma';

export async function generateUniqueReferralCode() {
  let referralCode = '';
  let isUnique = false;
  while (!isUnique) {
    referralCode = 'FIN-' + Math.random().toString(36).substring(2, 8).toUpperCase();
    const existing = await prisma.user.findUnique({ where: { referralCode } });
    if (!existing) isUnique = true;
  }
  return referralCode;
}