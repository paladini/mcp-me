import { z } from "zod";

export const lastfmPluginConfigSchema = z.object({
  enabled: z.boolean().optional().default(true),
  username: z.string().describe("Last.fm username"),
  api_key_env: z.string().optional().describe("Env var for Last.fm API key"),
});

export type LastfmPluginConfig = z.infer<typeof lastfmPluginConfigSchema>;
