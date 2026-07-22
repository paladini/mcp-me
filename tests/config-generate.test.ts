import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { readFile, rm, mkdir, writeFile, access } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { generateProfile } from "../src/generator.js";
import { parse as parseYaml } from "yaml";

const TEST_DIR = join(tmpdir(), `mcp-me-config-gen-${Date.now()}`);

const MOCK_DEVTO_ARTICLES = [
  {
    id: 1,
    title: "Hello DEV.to",
    description: "This is a full article body about TypeScript and testing.",
    url: "https://dev.to/user/hello",
    published_at: "2024-06-01T00:00:00Z",
    positive_reactions_count: 10,
    comments_count: 2,
    reading_time_minutes: 3,
    tag_list: ["typescript", "testing"],
  },
];

describe("config-generate flow", () => {
  beforeEach(async () => {
    await mkdir(TEST_DIR, { recursive: true });
    await writeFile(
      join(TEST_DIR, ".mcp-me.yaml"),
      `generators:
  devto: testuser
`,
      "utf-8",
    );
    vi.stubGlobal(
      "fetch",
      vi.fn(async (url: string) => {
        if (url.includes("dev.to/api/articles")) {
          return { ok: true, json: async () => MOCK_DEVTO_ARTICLES };
        }
        return { ok: false, status: 404, statusText: "Not Found" };
      }),
    );
  });

  afterEach(async () => {
    vi.unstubAllGlobals();
    await rm(TEST_DIR, { recursive: true, force: true });
  });

  it("generates profile from .mcp-me.yaml config and syncs corpus", async () => {
    const result = await generateProfile({ directory: TEST_DIR, devto: "testuser", force: true });

    expect(result.sources).toContain("devto");
    expect(result.filesCreated.length).toBeGreaterThan(0);

    const projectsYaml = await readFile(join(TEST_DIR, "projects.yaml"), "utf-8");
    const projects = parseYaml(projectsYaml) as { projects: { name: string }[] };
    expect(projects.projects[0].name).toBe("Hello DEV.to");

    await expect(access(join(TEST_DIR, "writing", "corpus", "2024-06-01-hello-dev-to.md"))).resolves.toBeUndefined();

    const manifestYaml = await readFile(join(TEST_DIR, "writing", "corpus", "_manifest.yaml"), "utf-8");
    const manifest = parseYaml(manifestYaml) as { entries: { title: string }[] };
    expect(manifest.entries.length).toBeGreaterThan(0);
  });

  it("skips corpus sync with noCorpus flag", async () => {
    await generateProfile({ directory: TEST_DIR, devto: "testuser", force: true, noCorpus: true });

    await expect(access(join(TEST_DIR, "writing", "corpus"))).rejects.toThrow();
  });
});
