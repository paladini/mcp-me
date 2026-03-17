import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { z } from "zod";
import type {
  McpMePlugin,
  PluginResource,
  PluginTool,
} from "../../plugin-engine/types.js";
import { linkedinConfigSchema, type LinkedInConfig } from "./schema.js";

interface LinkedInPosition {
  title?: string;
  companyName?: string;
  location?: string;
  description?: string;
  startDate?: { month?: number; year?: number };
  endDate?: { month?: number; year?: number };
}

interface LinkedInEducation {
  schoolName?: string;
  degreeName?: string;
  fieldOfStudy?: string;
  startDate?: { year?: number };
  endDate?: { year?: number };
}

interface LinkedInSkill {
  name?: string;
}

interface LinkedInData {
  profile?: {
    firstName?: string;
    lastName?: string;
    headline?: string;
    summary?: string;
    location?: string;
    industryName?: string;
  };
  positions?: LinkedInPosition[];
  education?: LinkedInEducation[];
  skills?: LinkedInSkill[];
  languages?: { name?: string; proficiency?: string }[];
  certifications?: { name?: string; authority?: string; timePeriod?: { startDate?: { year?: number } } }[];
  [key: string]: unknown;
}

class LinkedInPlugin implements McpMePlugin {
  name = "linkedin";
  description = "Provides professional history from LinkedIn exported data (JSON format).";
  version = "0.1.0";

  private config!: LinkedInConfig;
  private data: LinkedInData | null = null;

  async initialize(rawConfig: Record<string, unknown>): Promise<void> {
    this.config = linkedinConfigSchema.parse(rawConfig);
    await this.loadData();
  }

  private async loadData(): Promise<void> {
    try {
      const filePath = resolve(this.config.data_path);
      const content = await readFile(filePath, "utf-8");
      this.data = JSON.parse(content) as LinkedInData;
    } catch (error) {
      console.error(`LinkedIn plugin: Failed to load data from ${this.config.data_path}:`, (error as Error).message);
      this.data = null;
    }
  }

  private formatDate(date?: { month?: number; year?: number }): string {
    if (!date?.year) return "Unknown";
    if (date.month) return `${date.year}-${String(date.month).padStart(2, "0")}`;
    return String(date.year);
  }

  getResources(): PluginResource[] {
    if (!this.data) return [];

    const resources: PluginResource[] = [];

    if (this.data.profile) {
      resources.push({
        name: "linkedin-profile",
        uri: "me://linkedin/profile",
        title: "LinkedIn Profile",
        description: "LinkedIn profile summary and headline",
        read: async () => JSON.stringify(this.data!.profile, null, 2),
      });
    }

    if (this.data.positions?.length) {
      resources.push({
        name: "linkedin-experience",
        uri: "me://linkedin/experience",
        title: "LinkedIn Experience",
        description: "Work experience from LinkedIn",
        read: async () => {
          const positions = (this.data!.positions ?? []).map((p) => ({
            title: p.title,
            company: p.companyName,
            location: p.location,
            description: p.description,
            start: this.formatDate(p.startDate),
            end: p.endDate ? this.formatDate(p.endDate) : "Present",
          }));
          return JSON.stringify(positions, null, 2);
        },
      });
    }

    if (this.data.education?.length) {
      resources.push({
        name: "linkedin-education",
        uri: "me://linkedin/education",
        title: "LinkedIn Education",
        description: "Education history from LinkedIn",
        read: async () => {
          const education = (this.data!.education ?? []).map((e) => ({
            school: e.schoolName,
            degree: e.degreeName,
            field: e.fieldOfStudy,
            start: e.startDate?.year ?? "Unknown",
            end: e.endDate?.year ?? "Unknown",
          }));
          return JSON.stringify(education, null, 2);
        },
      });
    }

    if (this.data.skills?.length) {
      resources.push({
        name: "linkedin-skills",
        uri: "me://linkedin/skills",
        title: "LinkedIn Skills",
        description: "Skills listed on LinkedIn",
        read: async () => {
          const skills = (this.data!.skills ?? []).map((s) => s.name).filter(Boolean);
          return JSON.stringify(skills, null, 2);
        },
      });
    }

    return resources;
  }

  getTools(): PluginTool[] {
    return [
      {
        name: "search_linkedin_data",
        title: "Search LinkedIn Data",
        description: "Search through the LinkedIn export data for specific information",
        inputSchema: z.object({
          query: z.string().describe("Search term to find in LinkedIn data"),
        }),
        annotations: { readOnlyHint: true },
        execute: async (input) => {
          if (!this.data) {
            return JSON.stringify({ error: "No LinkedIn data loaded" });
          }

          const query = (input.query as string).toLowerCase();
          const results: string[] = [];

          function searchObj(obj: unknown, path: string): void {
            if (typeof obj === "string" && obj.toLowerCase().includes(query)) {
              results.push(`${path}: ${obj}`);
            } else if (Array.isArray(obj)) {
              obj.forEach((item, i) => searchObj(item, `${path}[${i}]`));
            } else if (obj !== null && typeof obj === "object") {
              for (const [key, value] of Object.entries(obj as Record<string, unknown>)) {
                searchObj(value, path ? `${path}.${key}` : key);
              }
            }
          }

          searchObj(this.data, "");

          if (results.length === 0) {
            return JSON.stringify({ message: `No matches found for "${input.query}"` });
          }

          return JSON.stringify({ matches: results.length, results: results.slice(0, 50) }, null, 2);
        },
      },
    ];
  }
}

export default function createPlugin(): McpMePlugin {
  return new LinkedInPlugin();
}
