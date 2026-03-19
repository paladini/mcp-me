import { z } from "zod";

export const mastodonPluginConfigSchema = z.object({
  enabled: z.boolean().optional().default(true),
  handle: z.string().describe("Full Mastodon handle (e.g. user@mastodon.social)"),
});

export type MastodonPluginConfig = z.infer<typeof mastodonPluginConfigSchema>;
