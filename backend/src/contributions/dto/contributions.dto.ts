import { z } from "zod";

export const recordContributionSchema = z.object({
  amount: z.coerce.number().positive(),
  dueAt: z.coerce.date().optional(),
  groupId: z.string().uuid(),
  reference: z.string().min(6).optional(),
});

export type RecordContributionInput = z.infer<typeof recordContributionSchema>;
