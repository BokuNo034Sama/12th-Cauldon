import { z } from "zod";

export const signupSchema = z.object({
  contributionAmount: z.coerce.number().positive(),
  email: z.string().email().toLowerCase(),
  fullName: z.string().min(2),
  inviteCode: z.string().min(6),
  phone: z.string().min(8),
});

export const loginSchema = z.object({
  identifier: z.string().min(3),
});

export const verifyOtpSchema = z.object({
  code: z.string().regex(/^\d{6}$/),
  identifier: z.string().min(3),
});

export type SignupInput = z.infer<typeof signupSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type VerifyOtpInput = z.infer<typeof verifyOtpSchema>;
