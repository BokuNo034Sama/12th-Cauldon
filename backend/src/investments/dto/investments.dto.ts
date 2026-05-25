import { z } from "zod";

const investmentStatusSchema = z.enum([
  "ACTIVE",
  "CANCELLED",
  "MATURED",
  "PROPOSED",
  "SELECTED",
  "VOTING",
]);

export const createProposalSchema = z.object({
  groupId: z.string().uuid(),
  summary: z.string().min(10).max(1000),
  title: z.string().min(3).max(160),
  votingEndsAt: z.coerce.date(),
});

export const listProposalsSchema = z.object({
  groupId: z.string().uuid(),
  status: z.string().optional().pipe(investmentStatusSchema.optional()),
});

export const voteOnProposalSchema = z.object({
  vote: z.enum(["APPROVE", "REJECT"]),
});

export type CreateProposalInput = z.input<typeof createProposalSchema>;
export type ListProposalsInput = z.input<typeof listProposalsSchema>;
export type VoteOnProposalInput = z.input<typeof voteOnProposalSchema>;
