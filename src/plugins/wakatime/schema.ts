import { z } from "zod";

export const wakatimePluginConfigSchema = z.object({
  enabled: z.boolean().optional().default(true),
  username: z.string().describe("WakaTime username"),
  api_key_env: z.string().optional().describe("Env var for WakaTime API key (for private profiles)"),
});

export type WakaTimePluginConfig = z.infer<typeof wakatimePluginConfigSchema>;
