import { z } from "zod";

export const baseEnvSchema = z.object({
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),
  NEXT_PUBLIC_APP_NAME: z.string().min(1).default("12th Cauldron"),
  NEXT_PUBLIC_APP_URL: z.string().url(),
});

export type BaseEnv = z.infer<typeof baseEnvSchema>;
