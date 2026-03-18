import { z } from "zod";

export const youtubePluginConfigSchema = z.object({
  enabled: z.boolean().optional().default(true),
  channel_id: z.string().describe("YouTube channel ID (e.g. UCxxxxxx)"),
  api_key_env: z.string().optional().describe("Env var for YouTube Data API v3 key"),
  max_videos: z.number().optional().default(20),
});

export type YouTubePluginConfig = z.infer<typeof youtubePluginConfigSchema>;
