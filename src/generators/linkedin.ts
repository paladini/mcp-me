/**
 * LinkedIn Generator
 *
 * Reads your LinkedIn data export (JSON) and populates career, skills, and identity.
 * LinkedIn doesn't have a public API — this reads from a local JSON export file.
 *
 * How to get your LinkedIn data:
 *   1. Go to linkedin.com/mypreferences/d/download-my-data
 *   2. Request your data in JSON format
 *   3. Download and extract — use the path to the extracted folder
 *
 * @flag --linkedin <json-path>
 * @example mcp-me generate ./profile --linkedin ~/Downloads/linkedin-export/Profile.json
 * @auth Local file (LinkedIn data export)
 * @data identity (name, headline, location), career (positions), skills, faq
 */
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import type { GeneratorSource, PartialProfile } from "./types.js";

interface LinkedInExport {
  profile?: {
    firstName?: string;
    lastName?: string;
    headline?: string;
    summary?: string;
    location?: string;
    industryName?: string;
  };
  positions?: {
    title?: string;
    companyName?: string;
    location?: string;
    description?: string;
    startDate?: { month?: number; year?: number };
    endDate?: { month?: number; year?: number };
  }[];
  education?: {
    schoolName?: string;
    degreeName?: string;
    fieldOfStudy?: string;
    startDate?: { year?: number };
    endDate?: { year?: number };
  }[];
  skills?: { name?: string }[];
  languages?: { name?: string; proficiency?: string }[];
  certifications?: { name?: string; authority?: string }[];
}

function formatDate(date?: { month?: number; year?: number }): string {
  if (!date?.year) return "YYYY-MM";
  if (date.month) return `${date.year}-${String(date.month).padStart(2, "0")}`;
  return `${date.year}-01`;
}

export const linkedinGenerator: GeneratorSource = {
  name: "linkedin",
  flag: "linkedin",
  flagArg: "<json-path>",
  description: "LinkedIn data export — career, skills, education",
  category: "identity",

  async generate(config): Promise<PartialProfile> {
    const jsonPath = config.username as string;
    if (!jsonPath) throw new Error("Path to LinkedIn JSON export is required");

    const absolutePath = resolve(jsonPath);
    console.log(`  [LinkedIn] Reading export from ${absolutePath}...`);

    let raw: string;
    try {
      raw = await readFile(absolutePath, "utf-8");
    } catch {
      throw new Error(
        `Cannot read LinkedIn export at: ${absolutePath}\n` +
        "  Download your data: linkedin.com/mypreferences/d/download-my-data\n" +
        "  Request JSON format, then provide the path to Profile.json"
      );
    }

    const data = JSON.parse(raw) as LinkedInExport;
    const p = data.profile;
    const fullName = [p?.firstName, p?.lastName].filter(Boolean).join(" ");
    console.log(`  [LinkedIn] Found profile: ${fullName || "Unknown"}`);

    // Identity
    const identity: PartialProfile["identity"] = {
      ...(fullName ? { name: fullName } : {}),
      ...(p?.headline ? { bio: p.headline } : {}),
      ...(p?.summary ? { bio: p.summary } : {}),
      ...(p?.location ? { location: { city: p.location } } : {}),
      contact: {
        social: [{ platform: "linkedin", url: "https://www.linkedin.com/", username: fullName }],
      },
    };

    // Career — positions
    const career: PartialProfile["career"] = {};
    if (data.positions?.length) {
      career.experience = data.positions.map((pos) => ({
        title: pos.title ?? "Unknown Role",
        company: pos.companyName ?? "Unknown Company",
        current: !pos.endDate,
        start_date: formatDate(pos.startDate),
        ...(pos.description ? { description: pos.description } : {}),
      }));
      console.log(`  [LinkedIn] Found ${career.experience.length} positions.`);
    }

    // Skills
    const skills: PartialProfile["skills"] = {};
    if (data.skills?.length) {
      skills.technical = data.skills
        .filter((s) => s.name)
        .map((s) => ({ name: s.name!, category: "linkedin-skill" }));
      console.log(`  [LinkedIn] Found ${skills.technical.length} skills.`);
    }

    // Languages
    if (data.languages?.length) {
      skills.languages = data.languages
        .filter((l) => l.name)
        .map((l) => ({
          name: l.name!,
          category: "human-language",
          ...(l.proficiency ? { proficiency: l.proficiency } : {}),
        }));
    }

    // FAQ — education, certifications, industry
    const faq: PartialProfile["faq"] = [];
    if (data.education?.length) {
      const eduSummary = data.education
        .map((e) => [e.degreeName, e.fieldOfStudy, e.schoolName].filter(Boolean).join(" — "))
        .join("; ");
      faq.push({ question: "What is your educational background?", answer: eduSummary, category: "education" });
    }
    if (data.certifications?.length) {
      const certNames = data.certifications.map((c) => c.name).filter(Boolean).join(", ");
      faq.push({ question: "Do you have certifications?", answer: `Yes: ${certNames}`, category: "education" });
    }
    if (p?.industryName) {
      faq.push({ question: "What industry do you work in?", answer: p.industryName, category: "career" });
    }

    // Interests from industry
    const interests: PartialProfile["interests"] = {};
    if (p?.industryName) {
      interests.topics = [p.industryName.toLowerCase()];
    }

    return {
      identity,
      ...(career.experience?.length ? { career } : {}),
      ...(skills.technical?.length || skills.languages?.length ? { skills } : {}),
      ...(faq.length ? { faq } : {}),
      ...(interests.topics?.length ? { interests } : {}),
    };
  },
};
