import { z } from "zod";

export const skillSchema = z.object({
  name: z.string().describe("Skill name"),
  category: z
    .string()
    .optional()
    .describe("Category, e.g. 'programming', 'devops', 'design', 'management'"),
  proficiency: z
    .enum(["expert", "advanced", "intermediate", "beginner"])
    .optional()
    .describe("Proficiency level"),
  years: z.number().optional().describe("Years of experience with this skill"),
  description: z.string().optional().describe("Additional context about this skill"),
});

export const skillsSchema = z.object({
  technical: z.array(skillSchema).optional().describe("Technical/hard skills"),
  soft: z.array(skillSchema).optional().describe("Soft skills and interpersonal abilities"),
  tools: z.array(skillSchema).optional().describe("Tools and software proficiencies"),
  languages: z.array(skillSchema).optional().describe("Programming languages"),
});

export type Skills = z.infer<typeof skillsSchema>;
