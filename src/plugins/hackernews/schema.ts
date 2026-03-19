import { z } from "zod";

export const hackernewsPluginConfigSchema = z.object({
  enabled: z.boolean().optional().default(true),
  username: z.string().describe("Hacker News username"),
});

export type HackerNewsPluginConfig = z.infer<typeof hackernewsPluginConfigSchema>;
