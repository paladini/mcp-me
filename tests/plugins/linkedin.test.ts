import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { writeFile, mkdir, rm } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import createLinkedInPlugin from "../../src/plugins/linkedin/index.js";
import type { McpMePlugin } from "../../src/plugin-engine/types.js";

const MOCK_LINKEDIN_DATA = {
  profile: {
    firstName: "Jane",
    lastName: "Doe",
    headline: "Senior Software Engineer",
    summary: "Experienced engineer with a passion for open source.",
    location: "Berlin, Germany",
    industryName: "Technology",
  },
  positions: [
    {
      title: "Senior Software Engineer",
      companyName: "BigTech GmbH",
      location: "Berlin",
      description: "Leading backend services team.",
      startDate: { month: 3, year: 2022 },
      endDate: null,
    },
    {
      title: "Software Engineer",
      companyName: "StartupCo",
      location: "Remote",
      description: "Full-stack development with TypeScript.",
      startDate: { month: 6, year: 2019 },
      endDate: { month: 2, year: 2022 },
    },
  ],
  education: [
    {
      schoolName: "TU Berlin",
      degreeName: "M.Sc.",
      fieldOfStudy: "Computer Science",
      startDate: { year: 2017 },
      endDate: { year: 2019 },
    },
  ],
  skills: [
    { name: "TypeScript" },
    { name: "Python" },
    { name: "Kubernetes" },
    { name: "PostgreSQL" },
  ],
};

const TEST_DIR = join(tmpdir(), "mcp-me-linkedin-test-" + Date.now());

describe("LinkedIn Plugin", () => {
  let plugin: McpMePlugin;

  beforeEach(async () => {
    await mkdir(TEST_DIR, { recursive: true });
    await writeFile(join(TEST_DIR, "linkedin.json"), JSON.stringify(MOCK_LINKEDIN_DATA));

    plugin = createLinkedInPlugin();
    await plugin.initialize({
      enabled: true,
      data_path: join(TEST_DIR, "linkedin.json"),
    });
  });

  afterEach(async () => {
    await rm(TEST_DIR, { recursive: true, force: true });
  });

  describe("initialization", () => {
    it("creates a plugin with correct metadata", () => {
      expect(plugin.name).toBe("linkedin");
      expect(plugin.version).toBe("0.1.0");
      expect(plugin.description).toContain("LinkedIn");
    });

    it("handles missing data file gracefully", async () => {
      const badPlugin = createLinkedInPlugin();
      await badPlugin.initialize({ enabled: true, data_path: "/nonexistent/file.json" });
      expect(badPlugin.getResources()).toHaveLength(0);
    });
  });

  describe("resources", () => {
    it("provides 4 resources", () => {
      expect(plugin.getResources()).toHaveLength(4);
    });

    it("has correct URIs", () => {
      const uris = plugin.getResources().map((r) => r.uri);
      expect(uris).toContain("me://linkedin/profile");
      expect(uris).toContain("me://linkedin/experience");
      expect(uris).toContain("me://linkedin/education");
      expect(uris).toContain("me://linkedin/skills");
    });

    it("reads profile", async () => {
      const resource = plugin.getResources().find((r) => r.uri === "me://linkedin/profile")!;
      const data = JSON.parse(await resource.read());
      expect(data.firstName).toBe("Jane");
      expect(data.headline).toBe("Senior Software Engineer");
    });

    it("reads experience with formatted dates", async () => {
      const resource = plugin.getResources().find((r) => r.uri === "me://linkedin/experience")!;
      const data = JSON.parse(await resource.read());
      expect(data).toHaveLength(2);
      expect(data[0].title).toBe("Senior Software Engineer");
      expect(data[0].company).toBe("BigTech GmbH");
      expect(data[0].start).toBe("2022-03");
      expect(data[0].end).toBe("Present");
      expect(data[1].end).toBe("2022-02");
    });

    it("reads education", async () => {
      const resource = plugin.getResources().find((r) => r.uri === "me://linkedin/education")!;
      const data = JSON.parse(await resource.read());
      expect(data).toHaveLength(1);
      expect(data[0].school).toBe("TU Berlin");
      expect(data[0].degree).toBe("M.Sc.");
      expect(data[0].field).toBe("Computer Science");
    });

    it("reads skills", async () => {
      const resource = plugin.getResources().find((r) => r.uri === "me://linkedin/skills")!;
      const data = JSON.parse(await resource.read());
      expect(data).toHaveLength(4);
      expect(data).toContain("TypeScript");
      expect(data).toContain("Kubernetes");
    });
  });

  describe("tools", () => {
    it("provides 1 tool", () => {
      expect(plugin.getTools()).toHaveLength(1);
    });

    it("search_linkedin_data finds matching text", async () => {
      const tool = plugin.getTools()[0];
      expect(tool.name).toBe("search_linkedin_data");

      const result = JSON.parse(await tool.execute({ query: "TypeScript" }));
      expect(result.matches).toBeGreaterThan(0);
      expect(result.results.some((r: string) => r.includes("TypeScript"))).toBe(true);
    });

    it("search_linkedin_data returns message for no matches", async () => {
      const tool = plugin.getTools()[0];
      const result = JSON.parse(await tool.execute({ query: "xyznonexistent" }));
      expect(result.message).toContain("No matches");
    });
  });

  describe("partial data", () => {
    it("handles data with only profile", async () => {
      const partialPlugin = createLinkedInPlugin();
      const partialPath = join(TEST_DIR, "partial.json");
      await writeFile(partialPath, JSON.stringify({ profile: MOCK_LINKEDIN_DATA.profile }));
      await partialPlugin.initialize({ enabled: true, data_path: partialPath });

      const resources = partialPlugin.getResources();
      expect(resources).toHaveLength(1);
      expect(resources[0].uri).toBe("me://linkedin/profile");
    });
  });
});
