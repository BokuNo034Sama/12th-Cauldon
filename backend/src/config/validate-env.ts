import { backendEnvSchema } from "./env.schema";

export function validateEnv(config: Record<string, unknown>) {
  return backendEnvSchema.parse(config);
}
