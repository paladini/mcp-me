import type { CorpusDocument } from "./types.js";
import type { WritingStyle } from "../schema/writing.js";
import { filterDocumentsByProfile } from "./corpus-loader.js";

export interface WritingStats {
  document_count: number;
  total_words: number;
  avg_sentence_length: number;
  avg_paragraph_length: number;
  first_person_ratio: number;
  exclamation_ratio: number;
  question_ratio: number;
  top_words: { word: string; count: number }[];
  punctuation: { period: number; comma: number; exclamation: number; question: number };
}

const STOP_WORDS = new Set([
  "the", "a", "an", "and", "or", "but", "in", "on", "at", "to", "for", "of", "is", "it",
  "that", "this", "with", "as", "by", "from", "be", "are", "was", "were", "been", "have",
  "has", "had", "do", "does", "did", "will", "would", "could", "should", "may", "might",
  "not", "no", "so", "if", "then", "than", "when", "what", "which", "who", "how", "all",
  "each", "every", "both", "few", "more", "most", "other", "some", "such", "only", "own",
  "same", "can", "just", "also", "very", "about", "into", "through", "during", "before",
  "after", "above", "below", "between", "under", "again", "further", "once", "here",
  "there", "where", "why", "out", "up", "down", "off", "over", "i", "you", "he", "she",
  "we", "they", "my", "your", "his", "her", "its", "our", "their", "me", "him", "us",
  "them", "am", "being", "been",
]);

function tokenize(text: string): string[] {
  return text.toLowerCase().match(/[a-z']+/g) ?? [];
}

function splitSentences(text: string): string[] {
  return text.split(/[.!?]+/).filter((s) => s.trim().length > 0);
}

function splitParagraphs(text: string): string[] {
  return text.split(/\n\n+/).filter((p) => p.trim().length > 0);
}

export function analyzeDocuments(documents: CorpusDocument[]): WritingStats {
  const allText = documents.map((d) => d.body).join("\n\n");
  const words = tokenize(allText);
  const sentences = splitSentences(allText);
  const paragraphs = splitParagraphs(allText);

  const wordFreq: Record<string, number> = {};
  for (const word of words) {
    if (STOP_WORDS.has(word) || word.length < 3) continue;
    wordFreq[word] = (wordFreq[word] ?? 0) + 1;
  }

  const topWords = Object.entries(wordFreq)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 20)
    .map(([word, count]) => ({ word, count }));

  const firstPerson = (allText.match(/\b(I|me|my|mine|we|our|us)\b/gi) ?? []).length;
  const totalWords = words.length || 1;

  return {
    document_count: documents.length,
    total_words: totalWords,
    avg_sentence_length: sentences.length > 0 ? Math.round(totalWords / sentences.length) : 0,
    avg_paragraph_length: paragraphs.length > 0 ? Math.round(totalWords / paragraphs.length) : 0,
    first_person_ratio: Math.round((firstPerson / totalWords) * 1000) / 1000,
    exclamation_ratio: Math.round(((allText.match(/!/g) ?? []).length / totalWords) * 1000) / 1000,
    question_ratio: Math.round(((allText.match(/\?/g) ?? []).length / totalWords) * 1000) / 1000,
    top_words: topWords,
    punctuation: {
      period: (allText.match(/\./g) ?? []).length,
      comma: (allText.match(/,/g) ?? []).length,
      exclamation: (allText.match(/!/g) ?? []).length,
      question: (allText.match(/\?/g) ?? []).length,
    },
  };
}

export function analyzeWritingStyle(
  documents: CorpusDocument[],
  style: WritingStyle | null,
  profile?: string,
): { profile: string | null; stats: WritingStats; style_guide: WritingStyle | null } {
  const filtered = filterDocumentsByProfile(documents, profile);
  const profileName = profile ?? style?.default_profile ?? null;
  const profileStyle =
    profileName && style?.profiles?.[profileName] ? style.profiles[profileName] : null;

  return {
    profile: profileName,
    stats: analyzeDocuments(filtered),
    style_guide: profileStyle
      ? { default_profile: profileName ?? undefined, profiles: { [profileName!]: profileStyle } }
      : style,
  };
}

export function compareProfiles(
  documents: CorpusDocument[],
  profileA: string,
  profileB: string,
): { profile_a: string; profile_b: string; stats_a: WritingStats; stats_b: WritingStats } {
  const docsA = filterDocumentsByProfile(documents, profileA);
  const docsB = filterDocumentsByProfile(documents, profileB);
  return {
    profile_a: profileA,
    profile_b: profileB,
    stats_a: analyzeDocuments(docsA),
    stats_b: analyzeDocuments(docsB),
  };
}
