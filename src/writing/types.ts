/** Article data for corpus sync from generators. */
export interface CorpusArticle {
  title: string;
  content: string;
  url?: string;
  date?: string;
  source: string;
  tags?: string[];
  formatProfile: string;
  tone?: string[];
}

/** Parsed corpus file with frontmatter metadata. */
export interface CorpusDocument {
  filename: string;
  title: string;
  source?: string;
  url?: string;
  date?: string;
  tags: string[];
  formatProfile?: string;
  tone: string[];
  wordCount: number;
  body: string;
}

/** Loaded writing bundle from profile directory. */
export interface WritingBundle {
  style: import("../schema/writing.js").WritingStyle | null;
  manifest: import("../schema/writing.js").CorpusManifest | null;
  documents: CorpusDocument[];
  valid: boolean;
  errors: string[];
}

/** Default format profile mapping by source. */
export const SOURCE_FORMAT_PROFILES: Record<string, string> = {
  medium: "personal_blog",
  substack: "personal_blog",
  blogger: "personal_blog",
  devto: "tech_news",
};
