import { z } from "zod";

export const steamPluginConfigSchema = z.object({
  enabled: z.boolean().optional().default(true),
  steam_id: z.string().describe("Steam64 ID or vanity URL name"),
  api_key_env: z.string().optional().describe("Env var for Steam Web API key"),
});

export type SteamPluginConfig = z.infer<typeof steamPluginConfigSchema>;
