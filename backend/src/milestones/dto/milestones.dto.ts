import { z } from "zod";

export const createMilestoneGoalSchema = z.object({
  dueAt: z.coerce.date().optional(),
  groupId: z.string().uuid(),
  name: z.string().trim().min(3).max(120),
  targetAmount: z.coerce.number().positive(),
});

export const listMilestoneGoalsSchema = z.object({
  groupId: z.string().uuid(),
});

export type CreateMilestoneGoalInput = z.input<
  typeof createMilestoneGoalSchema
>;

export type ListMilestoneGoalsInput = z.input<typeof listMilestoneGoalsSchema>;
