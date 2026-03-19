import { z } from "zod";

export const devtoPluginConfigSchema = z.object({
  enabled: z.boolean().optional().default(true),
  username: z.string().describe("DEV.to username"),
  api_key_env: z.string().optional().describe("Env var for DEV.to API key (optional, for higher rate limits)"),
});

export type DevToPluginConfig = z.infer<typeof devtoPluginConfigSchema>;
