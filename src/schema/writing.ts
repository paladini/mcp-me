import { z } from "zod";

export const writingProfileSchema = z.object({
  format: z.string().optional().describe("Content format, e.g. blog_post, news_article, social_post"),
  tone: z.array(z.string()).optional().describe("Tone descriptors, e.g. conversational, technical"),
  formality: z
    .enum(["casual", "neutral", "professional", "formal"])
    .optional()
    .describe("Formality level"),
  perspective: z
    .enum(["first-person", "second-person", "third-person"])
    .optional()
    .describe("Narrative perspective"),
  typical_length: z.string().optional().describe("Typical length, e.g. '800-1500 words'"),
  corpus_tags: z.array(z.string()).optional().describe("Tags used to filter corpus entries"),
  examples: z.array(z.string()).optional().describe("Example corpus filenames"),
});

export const writingStyleSchema = z.object({
  default_profile: z.string().optional().describe("Default format profile name"),
  global_voice: z
    .object({
      tone: z.array(z.string()).optional(),
      notes: z.string().optional(),
    })
    .optional()
    .describe("Voice attributes shared across all format profiles"),
  profiles: z
    .record(z.string(), writingProfileSchema)
    .optional()
    .describe("Named writing format profiles"),
});

export const corpusManifestEntrySchema = z.object({
  filename: z.string(),
  title: z.string(),
  source: z.string().optional(),
  url: z.string().url().optional(),
  date: z.string().optional(),
  tags: z.array(z.string()).optional(),
  format_profile: z.string().optional(),
  tone: z.array(z.string()).optional(),
  word_count: z.number().optional(),
});

export const corpusManifestSchema = z.object({
  entries: z.array(corpusManifestEntrySchema),
  updated_at: z.string().nullable().optional(),
});

export type WritingStyle = z.infer<typeof writingStyleSchema>;
export type WritingProfile = z.infer<typeof writingProfileSchema>;
export type CorpusManifest = z.infer<typeof corpusManifestSchema>;
export type CorpusManifestEntry = z.infer<typeof corpusManifestEntrySchema>;
