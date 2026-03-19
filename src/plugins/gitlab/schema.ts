import { z } from "zod";

export const gitlabPluginConfigSchema = z.object({
  enabled: z.boolean().optional().default(true),
  username: z.string().describe("GitLab username"),
  instance_url: z.string().optional().default("https://gitlab.com").describe("GitLab instance URL"),
  token_env: z.string().optional().describe("Env var for GitLab personal access token (optional, for private data)"),
  max_projects: z.number().optional().default(30),
});

export type GitLabPluginConfig = z.infer<typeof gitlabPluginConfigSchema>;
