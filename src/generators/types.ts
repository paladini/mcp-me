/**
 * Partial profile data produced by a single data source (GitHub, SO, DEV.to, npm).
 * Multiple PartialProfile objects get merged into the final YAML files.
 */
export interface PartialProfile {
  identity?: {
    name?: string;
    bio?: string;
    location?: { city?: string; country?: string };
    contact?: {
      email?: string;
      website?: string;
      social?: { platform: string; url: string; username?: string }[];
    };
  };
  skills?: {
    languages?: { name: string; category?: string; proficiency?: string; description?: string }[];
    technical?: { name: string; category?: string; proficiency?: string; description?: string }[];
    tools?: { name: string; category?: string }[];
  };
  projects?: {
    name: string;
    description: string;
    url?: string;
    repo_url?: string;
    status?: string;
    technologies?: string[];
    start_date?: string;
    stars?: number;
    category?: string;
  }[];
  career?: {
    experience?: {
      title: string;
      company: string;
      current?: boolean;
      start_date?: string;
      description?: string;
    }[];
  };
  interests?: {
    hobbies?: string[];
    topics?: string[];
  };
  faq?: { question: string; answer: string; category?: string }[];
  plugins?: Record<string, Record<string, unknown>>;
}

export type GeneratorCategory =
  | "code"
  | "writing"
  | "community"
  | "packages"
  | "activity"
  | "identity"
  | "gaming"
  | "music"
  | "creative"
  | "fitness"
  | "food"
  | "travel"
  | "learning"
  | "science"
  | "finance"
  | "maker"
  | "social"
  | "entertainment"
  | "podcasts"
  | "photography"
  | "sports"
  | "nature"
  | "productivity"
  | "crypto";

export interface GeneratorSource {
  /** Unique identifier, e.g. "github", "stackoverflow" */
  name: string;
  /** CLI flag name, e.g. "github" becomes --github */
  flag: string;
  /** CLI flag argument label, e.g. "<username>" or "<email>" */
  flagArg: string;
  /** Short description for CLI help */
  description: string;
  /** Category for grouping in help output */
  category: GeneratorCategory;
  /** Fetch data and return partial profile */
  generate(config: Record<string, unknown>): Promise<PartialProfile>;
}

export interface GenerateOptions {
  directory: string;
  force?: boolean;
  [source: string]: string | boolean | undefined;
}

export interface GenerateResult {
  filesCreated: string[];
  warnings: string[];
  sources: string[];
  summary: {
    name?: string;
    skills?: number;
    projects?: number;
    sources: string[];
  };
}
