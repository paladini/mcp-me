import { z } from "zod";

export const socialLinkSchema = z.object({
  platform: z.string().describe("Platform name, e.g. 'github', 'twitter', 'linkedin'"),
  url: z.string().url().describe("Full URL to profile"),
  username: z.string().optional().describe("Username on the platform"),
});

export const identitySchema = z.object({
  name: z.string().describe("Full name"),
  nickname: z.string().optional().describe("Preferred nickname or alias"),
  pronouns: z.string().optional().describe("Preferred pronouns, e.g. 'he/him'"),
  bio: z.string().describe("Short biography (1-3 sentences)"),
  bio_extended: z.string().optional().describe("Longer biography for detailed introductions"),
  photo_url: z.string().url().optional().describe("URL to profile photo"),
  location: z
    .object({
      city: z.string().optional(),
      state: z.string().optional(),
      country: z.string(),
      timezone: z.string().optional().describe("IANA timezone, e.g. 'America/Sao_Paulo'"),
    })
    .optional()
    .describe("Current location"),
  languages: z
    .array(
      z.object({
        language: z.string(),
        proficiency: z.enum(["native", "fluent", "advanced", "intermediate", "beginner"]),
      }),
    )
    .optional()
    .describe("Languages spoken"),
  contact: z
    .object({
      email: z.string().email().optional(),
      website: z.string().url().optional(),
      social: z.array(socialLinkSchema).optional(),
    })
    .optional()
    .describe("Contact information"),
  date_of_birth: z.string().optional().describe("Date of birth (YYYY-MM-DD)"),
  nationality: z.string().optional(),
});

export type Identity = z.infer<typeof identitySchema>;
