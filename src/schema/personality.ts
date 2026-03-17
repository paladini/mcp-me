import { z } from "zod";

export const personalitySchema = z.object({
  traits: z.array(z.string()).optional().describe("Key personality traits"),
  values: z.array(z.string()).optional().describe("Core personal values"),
  mbti: z.string().optional().describe("Myers-Briggs type, e.g. 'INTJ'"),
  enneagram: z.string().optional().describe("Enneagram type, e.g. '5w4'"),
  strengths: z.array(z.string()).optional().describe("Key strengths"),
  weaknesses: z.array(z.string()).optional().describe("Known areas for improvement"),
  work_style: z
    .object({
      preference: z
        .enum(["remote", "hybrid", "office", "flexible"])
        .optional()
        .describe("Work location preference"),
      schedule: z.string().optional().describe("Preferred schedule, e.g. 'early bird'"),
      collaboration: z.string().optional().describe("Collaboration style"),
      communication: z.string().optional().describe("Preferred communication style"),
    })
    .optional()
    .describe("Work style preferences"),
  motivations: z.array(z.string()).optional().describe("What motivates this person"),
  fun_facts: z.array(z.string()).optional().describe("Fun or quirky facts"),
});

export type Personality = z.infer<typeof personalitySchema>;
