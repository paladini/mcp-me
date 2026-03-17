import { z } from "zod";

export const interestItemSchema = z.object({
  name: z.string().describe("Item name"),
  category: z.string().optional().describe("Sub-category"),
  note: z.string().optional().describe("Personal note or opinion"),
  favorite: z.boolean().optional().default(false).describe("Whether this is a top favorite"),
  url: z.string().url().optional().describe("Related URL"),
});

export const interestsSchema = z.object({
  hobbies: z.array(z.string()).optional().describe("General hobbies and activities"),
  music: z
    .object({
      genres: z.array(z.string()).optional(),
      artists: z.array(interestItemSchema).optional(),
      albums: z.array(interestItemSchema).optional(),
    })
    .optional()
    .describe("Music preferences"),
  books: z
    .object({
      genres: z.array(z.string()).optional(),
      favorites: z.array(interestItemSchema).optional(),
      currently_reading: z.array(interestItemSchema).optional(),
    })
    .optional()
    .describe("Reading preferences"),
  movies_and_tv: z
    .object({
      genres: z.array(z.string()).optional(),
      favorites: z.array(interestItemSchema).optional(),
    })
    .optional()
    .describe("Movie and TV preferences"),
  food: z
    .object({
      cuisines: z.array(z.string()).optional(),
      favorites: z.array(interestItemSchema).optional(),
      dietary: z.string().optional().describe("Dietary preferences or restrictions"),
    })
    .optional()
    .describe("Food preferences"),
  sports: z
    .object({
      practice: z.array(z.string()).optional().describe("Sports actively practiced"),
      follow: z.array(z.string()).optional().describe("Sports followed as a fan"),
      teams: z.array(interestItemSchema).optional(),
    })
    .optional()
    .describe("Sports interests"),
  travel: z
    .object({
      visited: z.array(z.string()).optional().describe("Countries or places visited"),
      wishlist: z.array(z.string()).optional().describe("Places to visit"),
    })
    .optional()
    .describe("Travel interests"),
  other: z.array(interestItemSchema).optional().describe("Other interests not covered above"),
});

export type Interests = z.infer<typeof interestsSchema>;
