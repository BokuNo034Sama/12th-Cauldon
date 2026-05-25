import { z } from "zod";

const treasuryTransactionTypeSchema = z.enum([
  "ADJUSTMENT",
  "CONTRIBUTION",
  "FEE",
  "INVESTMENT_ALLOCATION",
  "INVESTMENT_RETURN",
  "PAYOUT",
  "REFUND",
]);

export const treasurySummarySchema = z.object({
  groupId: z.string().uuid(),
});

export const transactionHistorySchema = z.object({
  groupId: z.string().uuid(),
  limit: z.coerce.number().int().min(1).max(100).default(50),
  type: z.string().optional().pipe(treasuryTransactionTypeSchema.optional()),
});

export type TreasurySummaryInput = z.input<typeof treasurySummarySchema>;
export type TransactionHistoryInput = z.input<typeof transactionHistorySchema>;
