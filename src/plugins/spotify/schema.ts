import { z } from "zod";

export const spotifyConfigSchema = z.object({
  enabled: z.boolean().optional().default(true),
  client_id_env: z.string().describe("Environment variable name for Spotify Client ID"),
  client_secret_env: z.string().describe("Environment variable name for Spotify Client Secret"),
  refresh_token_env: z.string().describe("Environment variable name for Spotify Refresh Token"),
  top_artists_limit: z.number().optional().default(20),
  top_tracks_limit: z.number().optional().default(20),
  recently_played_limit: z.number().optional().default(20),
  time_range: z
    .enum(["short_term", "medium_term", "long_term"])
    .optional()
    .default("medium_term")
    .describe("Time range for top items: short_term (4 weeks), medium_term (6 months), long_term (years)"),
});

export type SpotifyConfig = z.infer<typeof spotifyConfigSchema>;
