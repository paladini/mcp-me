import { z } from "zod";

export const githubConfigSchema = z.object({
  enabled: z.boolean().optional().default(true),
  username: z.string().describe("GitHub username"),
  token_env: z
    .string()
    .optional()
    .describe("Environment variable name containing the GitHub token"),
  include_forks: z.boolean().optional().default(false),
  max_repos: z.number().optional().default(30),
});

export type GitHubConfig = z.infer<typeof githubConfigSchema>;
