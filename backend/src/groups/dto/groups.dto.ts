import { z } from "zod";

export const createGroupSchema = z.object({
  cycleDurationMonths: z.coerce.number().int().positive().default(12),
  description: z.string().max(500).optional(),
  monthlyContribution: z.coerce.number().positive(),
  name: z.string().min(2).max(120),
  riskProfile: z.enum(["CONSERVATIVE", "BALANCED", "GROWTH"]),
});

export const inviteMemberSchema = z
  .object({
    email: z.string().email().toLowerCase().optional(),
    expiresInDays: z.coerce.number().int().min(1).max(30).default(7),
    phone: z.string().min(8).optional(),
  })
  .refine(
    (value) => value.email || value.phone,
    "Invite requires email or phone.",
  );

export const updateContributionRulesSchema = z.object({
  cycleDurationMonths: z.coerce.number().int().positive().optional(),
  monthlyContribution: z.coerce.number().positive().optional(),
  riskProfile: z.enum(["CONSERVATIVE", "BALANCED", "GROWTH"]).optional(),
});

export const updateMemberAdminSchema = z.object({
  isAdmin: z.boolean(),
});

export const updateMemberStatusSchema = z.object({
  status: z.enum(["ACTIVE", "SUSPENDED", "REMOVED", "EXITED"]),
});

export type CreateGroupInput = z.infer<typeof createGroupSchema>;
export type InviteMemberInput = z.infer<typeof inviteMemberSchema>;
export type UpdateContributionRulesInput = z.infer<
  typeof updateContributionRulesSchema
>;
export type UpdateMemberAdminInput = z.infer<typeof updateMemberAdminSchema>;
export type UpdateMemberStatusInput = z.infer<typeof updateMemberStatusSchema>;
