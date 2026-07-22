import { z } from "zod";

export const traitScoreSchema = z.object({
  trait: z.string().describe("Trait or dimension name, e.g. 'openness', 'dominance'"),
  score: z.number().min(0).max(100).describe("Normalised score, 0-100"),
});

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

  big_five: z
    .array(traitScoreSchema)
    .optional()
    .describe(
      "Big Five (OCEAN) trait scores — openness, conscientiousness, extraversion, " +
        "agreeableness, neuroticism — each normalised 0-100",
    ),
  disc: z
    .array(traitScoreSchema)
    .optional()
    .describe(
      "DISC dimension scores — dominance, influence, steadiness, compliance — " +
        "each normalised 0-100",
    ),
  assessed_at: z
    .string()
    .optional()
    .describe("ISO date (YYYY-MM-DD) the most recent structured assessment was taken"),
});

export type Personality = z.infer<typeof personalitySchema>;
export type TraitScore = z.infer<typeof traitScoreSchema>;
