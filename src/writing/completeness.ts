import { PROFILE_CATEGORIES } from "../schema/index.js";
import type { ProfileBundle } from "../loader.js";
import type { WritingBundle } from "./types.js";

export interface DomainCompleteness {
  domain: string;
  filled: boolean;
  score: number;
  suggestions: string[];
}

export interface ProfileCompleteness {
  overall_percent: number;
  domains: DomainCompleteness[];
}

function hasContent(value: unknown): boolean {
  if (value === null || value === undefined) return false;
  if (typeof value === "string") return value.trim().length > 0;
  if (Array.isArray(value)) return value.length > 0;
  if (typeof value === "object") {
    return Object.values(value as Record<string, unknown>).some(hasContent);
  }
  return true;
}

function scoreObject(obj: Record<string, unknown>, fields: string[]): number {
  if (fields.length === 0) return 0;
  const filled = fields.filter((f) => hasContent(obj[f])).length;
  return Math.round((filled / fields.length) * 100);
}

export function getProfileCompleteness(
  profile: ProfileBundle,
  writing: WritingBundle,
): ProfileCompleteness {
  const domains: DomainCompleteness[] = [];

  for (const category of PROFILE_CATEGORIES) {
    const data = profile.data[category] as Record<string, unknown> | undefined;
    const suggestions: string[] = [];

    if (!data) {
      domains.push({
        domain: category,
        filled: false,
        score: 0,
        suggestions: [`Add ${category}.yaml — run mcp-me init or edit manually`],
      });
      continue;
    }

    let score = 50;
    switch (category) {
      case "identity":
        score = scoreObject(data, ["name", "bio", "headline", "location", "contact"]);
        if (!hasContent(data.contact)) suggestions.push("Add social links with mcp-me generate --github");
        break;
      case "career":
        score = hasContent(data.experience) || hasContent(data.education) ? 80 : 20;
        if (!hasContent(data.experience)) suggestions.push("Add LinkedIn export: mcp-me generate --linkedin /path/to/export.zip");
        break;
      case "skills":
        score = hasContent(data.technical) || hasContent(data.languages) ? 85 : 15;
        if (!hasContent(data.languages)) suggestions.push("Run mcp-me generate --github to infer skills");
        break;
      case "projects":
        score = hasContent(data.projects) ? 90 : 10;
        if (!hasContent(data.projects)) suggestions.push("Run mcp-me generate --github or --devto");
        break;
      case "interests":
        score = hasContent(data.hobbies) || hasContent(data.topics) ? 70 : 20;
        break;
      case "personality":
        score = hasContent(data.traits) || hasContent(data.values) ? 75 : 10;
        if (score < 50) suggestions.push("Edit personality.yaml manually — traits, values, work_style");
        break;
      case "goals":
        score = hasContent(data.short_term) || hasContent(data.long_term) ? 80 : 10;
        if (score < 50) suggestions.push("Edit goals.yaml manually");
        break;
      case "faq":
        score = hasContent(data.items) ? 85 : 15;
        break;
    }

    domains.push({ domain: category, filled: score > 0, score, suggestions });
  }

  // Writing domain
  const writingScore =
    (writing.style ? 40 : 0) +
    (writing.documents.length > 0 ? Math.min(60, writing.documents.length * 10) : 0);
  domains.push({
    domain: "writing",
    filled: writing.documents.length > 0,
    score: Math.min(100, writingScore),
    suggestions:
      writing.documents.length === 0
        ? ["Run mcp-me generate --medium or --substack to sync writing corpus", "Add local .md files to writing/corpus/"]
        : [],
  });

  const overall = Math.round(domains.reduce((sum, d) => sum + d.score, 0) / domains.length);

  return { overall_percent: overall, domains };
}
