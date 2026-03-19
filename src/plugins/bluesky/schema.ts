import { z } from "zod";

export const blueskyPluginConfigSchema = z.object({
  enabled: z.boolean().optional().default(true),
  handle: z.string().describe("Bluesky handle (e.g. alice.bsky.social)"),
});

export type BlueskyPluginConfig = z.infer<typeof blueskyPluginConfigSchema>;
