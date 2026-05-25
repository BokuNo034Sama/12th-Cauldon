import { z } from "zod";

export const backendEnvSchema = z.object({
  DATABASE_URL: z.string().url(),
  JWT_SECRET: z.string().min(32),
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),
  OTP_SECRET: z.string().min(32),
  PORT: z.coerce.number().int().positive().default(4000),
  SMS_CHANNEL: z.enum(["generic", "dnd", "whatsapp"]).default("generic"),
  SMS_PROVIDER: z.enum(["mock", "termii"]).default("mock"),
  SMS_SENDER_ID: z.string().trim().min(3).max(11).default("12Cauldron"),
  TERMII_API_KEY: z.string().trim().optional(),
  TERMII_BASE_URL: z.string().url().default("https://api.ng.termii.com"),
});

export type BackendEnv = z.infer<typeof backendEnvSchema>;
