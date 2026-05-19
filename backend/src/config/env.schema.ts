import { z } from "zod";

export const backendEnvSchema = z.object({
  DATABASE_URL: z.string().url(),
  JWT_SECRET: z.string().min(32),
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),
  OTP_SECRET: z.string().min(32),
  PORT: z.coerce.number().int().positive().default(4000),
});

export type BackendEnv = z.infer<typeof backendEnvSchema>;
