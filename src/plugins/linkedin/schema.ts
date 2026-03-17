import { z } from "zod";

export const linkedinConfigSchema = z.object({
  enabled: z.boolean().optional().default(true),
  data_path: z.string().describe("Path to the LinkedIn data export JSON file"),
});

export type LinkedInConfig = z.infer<typeof linkedinConfigSchema>;
