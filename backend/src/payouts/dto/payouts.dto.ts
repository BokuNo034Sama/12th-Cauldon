import { z } from "zod";

export const payoutScheduleSchema = z.object({
  groupId: z.string().uuid(),
});

export const voluntaryExitSchema = z.object({
  reason: z.string().trim().max(500).optional(),
});

export const executeMaturityPayoutsSchema = z.object({
  groupId: z.string().uuid(),
  payoutDate: z.coerce.date().optional(),
});

export const reinvestProfitSchema = z.object({
  amount: z.coerce.number().positive(),
  groupId: z.string().uuid(),
  target: z.enum(["TREASURY_RESERVE", "SELECTED_INVESTMENTS"]),
});

export type PayoutScheduleInput = z.input<typeof payoutScheduleSchema>;
export type VoluntaryExitInput = z.input<typeof voluntaryExitSchema>;
export type ExecuteMaturityPayoutsInput = z.input<
  typeof executeMaturityPayoutsSchema
>;
export type ReinvestProfitInput = z.input<typeof reinvestProfitSchema>;
