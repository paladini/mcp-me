import { z } from "zod";

export const faqItemSchema = z.object({
  question: z.string().describe("The question"),
  answer: z.string().describe("The answer"),
  category: z.string().optional().describe("Category for grouping, e.g. 'work', 'personal'"),
  tags: z.array(z.string()).optional().describe("Tags for searchability"),
});

export const faqSchema = z.object({
  items: z.array(faqItemSchema).describe("List of FAQ entries"),
});

export type Faq = z.infer<typeof faqSchema>;
