import { z } from 'zod';

export const circleSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters').max(50),
  description: z.string().max(500).optional(),
  contributionAmount: z.number().positive('Amount must be positive').min(1),
  frequency: z.enum(['daily', 'weekly', 'biweekly', 'monthly']),
  totalRounds: z.number().int().min(2).max(52),
  penaltyRate: z.number().min(0).max(1).default(0.1),
});

export const memberSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
});

export const contributionSchema = z.object({
  circleId: z.number().int().positive(),
  round: z.number().int().positive(),
  amount: z.number().positive(),
});

export function validateCircleData(data) {
  return circleSchema.parse(data);
}

export function validateMemberData(data) {
  return memberSchema.parse(data);
}

export function validateContribution(data) {
  return contributionSchema.parse(data);
}

export function isValidFlowAddress(address) {
  return /^0x[a-fA-F0-9]{16}$/.test(address);
}

export function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function isValidPhone(phone) {
  return /^\+?[\d\s-()]+$/.test(phone);
}
