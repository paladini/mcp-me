import { z } from "zod";

export const goalSchema = z.object({
  title: z.string().describe("Goal title"),
  description: z.string().optional().describe("Detailed description"),
  status: z
    .enum(["not_started", "in_progress", "completed", "on_hold"])
    .optional()
    .default("not_started"),
  target_date: z.string().optional().describe("Target completion date (YYYY-MM-DD or YYYY)"),
  category: z.string().optional().describe("Category, e.g. 'career', 'personal', 'health'"),
});

export const goalsSchema = z.object({
  short_term: z.array(goalSchema).optional().describe("Goals for the next 0-6 months"),
  medium_term: z.array(goalSchema).optional().describe("Goals for 6 months to 2 years"),
  long_term: z.array(goalSchema).optional().describe("Goals for 2+ years"),
  life_goals: z.array(goalSchema).optional().describe("Lifetime aspirations"),
});

export type Goals = z.infer<typeof goalsSchema>;
