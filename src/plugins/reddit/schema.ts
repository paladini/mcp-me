import { z } from "zod";

export const redditPluginConfigSchema = z.object({
  enabled: z.boolean().optional().default(true),
  username: z.string().describe("Reddit username"),
});

export type RedditPluginConfig = z.infer<typeof redditPluginConfigSchema>;
