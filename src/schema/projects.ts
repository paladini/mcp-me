import { z } from "zod";

export const projectSchema = z.object({
  name: z.string().describe("Project name"),
  description: z.string().describe("Short description"),
  url: z.string().url().optional().describe("Project URL (website, repo, etc.)"),
  repo_url: z.string().url().optional().describe("Source code repository URL"),
  status: z
    .enum(["active", "maintained", "archived", "concept", "completed"])
    .optional()
    .default("active"),
  technologies: z.array(z.string()).optional().describe("Technologies used"),
  role: z.string().optional().describe("Your role in the project"),
  highlights: z.array(z.string()).optional().describe("Key achievements or features"),
  start_date: z.string().optional().describe("When the project started"),
  end_date: z.string().optional().describe("When the project ended"),
  stars: z.number().optional().describe("GitHub stars or similar metric"),
  category: z
    .string()
    .optional()
    .describe("Category, e.g. 'open-source', 'freelance', 'personal'"),
});

export const projectsSchema = z.object({
  projects: z.array(projectSchema).describe("List of projects"),
});

export type Projects = z.infer<typeof projectsSchema>;
