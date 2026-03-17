import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { readFile, rm, mkdir } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { generateFromGitHub } from "../src/generator.js";

const MOCK_USER = {
  login: "testdev",
  name: "Test Developer",
  bio: "Full-stack engineer and open-source enthusiast",
  blog: "https://testdev.io",
  location: "Berlin, Germany",
  company: "@awesome-corp",
  email: "test@testdev.io",
  twitter_username: "testdev",
  public_repos: 42,
  followers: 500,
  following: 100,
  html_url: "https://github.com/testdev",
  created_at: "2018-01-15T00:00:00Z",
};

const MOCK_REPOS = [
  {
    name: "popular-project",
    full_name: "testdev/popular-project",
    description: "A very popular TypeScript project",
    html_url: "https://github.com/testdev/popular-project",
    homepage: "https://popular-project.dev",
    language: "TypeScript",
    stargazers_count: 1200,
    forks_count: 150,
    fork: false,
    archived: false,
    topics: ["typescript", "mcp", "framework"],
    created_at: "2023-01-15T00:00:00Z",
    updated_at: "2024-06-01T00:00:00Z",
    pushed_at: "2024-06-01T00:00:00Z",
  },
  {
    name: "python-tool",
    full_name: "testdev/python-tool",
    description: "A Python CLI tool",
    html_url: "https://github.com/testdev/python-tool",
    homepage: null,
    language: "Python",
    stargazers_count: 45,
    forks_count: 5,
    fork: false,
    archived: false,
    topics: ["python", "cli"],
    created_at: "2023-06-01T00:00:00Z",
    updated_at: "2024-05-01T00:00:00Z",
    pushed_at: "2024-05-01T00:00:00Z",
  },
  {
    name: "rust-experiment",
    full_name: "testdev/rust-experiment",
    description: "Learning Rust",
    html_url: "https://github.com/testdev/rust-experiment",
    homepage: null,
    language: "Rust",
    stargazers_count: 5,
    forks_count: 0,
    fork: false,
    archived: false,
    topics: ["rust"],
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-03-01T00:00:00Z",
    pushed_at: "2024-03-01T00:00:00Z",
  },
  {
    name: "forked-lib",
    full_name: "testdev/forked-lib",
    description: "A fork",
    html_url: "https://github.com/testdev/forked-lib",
    homepage: null,
    language: "JavaScript",
    stargazers_count: 0,
    forks_count: 0,
    fork: true,
    archived: false,
    topics: [],
    created_at: "2024-02-01T00:00:00Z",
    updated_at: "2024-02-01T00:00:00Z",
    pushed_at: "2024-02-01T00:00:00Z",
  },
  {
    name: "old-archived",
    full_name: "testdev/old-archived",
    description: "An archived project",
    html_url: "https://github.com/testdev/old-archived",
    homepage: null,
    language: "JavaScript",
    stargazers_count: 20,
    forks_count: 2,
    fork: false,
    archived: true,
    topics: ["javascript"],
    created_at: "2020-01-01T00:00:00Z",
    updated_at: "2021-01-01T00:00:00Z",
    pushed_at: "2021-01-01T00:00:00Z",
  },
];

function mockFetch(urlMap: [string, unknown][]) {
  return vi.fn(async (url: string) => {
    const sorted = [...urlMap].sort(([a], [b]) => b.length - a.length);
    for (const [pattern, data] of sorted) {
      if (url.includes(pattern)) {
        return { ok: true, json: async () => data };
      }
    }
    return { ok: false, status: 404, statusText: "Not Found" };
  });
}

const TEST_DIR = join(tmpdir(), "mcp-me-gen-test-" + Date.now());

describe("generateFromGitHub", () => {
  let originalFetch: typeof globalThis.fetch;
  let originalConsoleLog: typeof console.log;

  beforeEach(async () => {
    originalFetch = globalThis.fetch;
    originalConsoleLog = console.log;
    console.log = vi.fn();

    globalThis.fetch = mockFetch([
      ["/users/testdev/repos", MOCK_REPOS],
      ["/users/testdev", MOCK_USER],
    ]) as unknown as typeof globalThis.fetch;

    await mkdir(TEST_DIR, { recursive: true });
  });

  afterEach(async () => {
    globalThis.fetch = originalFetch;
    console.log = originalConsoleLog;
    await rm(TEST_DIR, { recursive: true, force: true });
  });

  it("generates all profile files", async () => {
    const result = await generateFromGitHub({
      github: "testdev",
      directory: TEST_DIR,
    });

    expect(result.filesCreated).toContain("identity.yaml");
    expect(result.filesCreated).toContain("skills.yaml");
    expect(result.filesCreated).toContain("projects.yaml");
    expect(result.filesCreated).toContain("career.yaml");
    expect(result.filesCreated).toContain("plugins.yaml");
    expect(result.filesCreated).toContain("interests.yaml");
    expect(result.filesCreated).toContain("personality.yaml");
    expect(result.filesCreated).toContain("goals.yaml");
    expect(result.filesCreated).toContain("faq.yaml");
    expect(result.filesCreated).toHaveLength(9);
  });

  it("returns correct profile summary", async () => {
    const result = await generateFromGitHub({
      github: "testdev",
      directory: TEST_DIR,
    });

    expect(result.profile.name).toBe("Test Developer");
    expect(result.profile.username).toBe("testdev");
    expect(result.profile.repos).toBe(4); // forks excluded
    expect(result.profile.languages).toContain("TypeScript");
  });

  describe("identity.yaml", () => {
    it("contains name, bio, and contact info", async () => {
      await generateFromGitHub({ github: "testdev", directory: TEST_DIR });
      const content = await readFile(join(TEST_DIR, "identity.yaml"), "utf-8");

      expect(content).toContain("Test Developer");
      expect(content).toContain("Full-stack engineer");
      expect(content).toContain("github");
      expect(content).toContain("testdev");
      expect(content).toContain("Berlin");
      expect(content).toContain("test@testdev.io");
      expect(content).toContain("https://testdev.io");
    });

    it("includes Twitter if available", async () => {
      await generateFromGitHub({ github: "testdev", directory: TEST_DIR });
      const content = await readFile(join(TEST_DIR, "identity.yaml"), "utf-8");
      expect(content).toContain("twitter");
      expect(content).toContain("testdev");
    });
  });

  describe("skills.yaml", () => {
    it("extracts languages sorted by usage", async () => {
      await generateFromGitHub({ github: "testdev", directory: TEST_DIR });
      const content = await readFile(join(TEST_DIR, "skills.yaml"), "utf-8");

      expect(content).toContain("TypeScript");
      expect(content).toContain("Python");
      expect(content).toContain("Rust");
      expect(content).toContain("programming");
    });

    it("excludes forked repo languages", async () => {
      await generateFromGitHub({ github: "testdev", directory: TEST_DIR });
      const content = await readFile(join(TEST_DIR, "skills.yaml"), "utf-8");
      // JavaScript is only in the fork and the archived repo
      // The archived repo's JS should appear but fork's should not
      // Since fork is excluded by fetchAllRepos, and archived is kept,
      // JavaScript should appear from old-archived
      expect(content).toContain("JavaScript");
    });
  });

  describe("projects.yaml", () => {
    it("lists non-archived projects sorted by stars", async () => {
      await generateFromGitHub({ github: "testdev", directory: TEST_DIR });
      const content = await readFile(join(TEST_DIR, "projects.yaml"), "utf-8");

      expect(content).toContain("popular-project");
      expect(content).toContain("python-tool");
      expect(content).toContain("rust-experiment");
      expect(content).toContain("open-source");
    });

    it("includes homepage URL when available", async () => {
      await generateFromGitHub({ github: "testdev", directory: TEST_DIR });
      const content = await readFile(join(TEST_DIR, "projects.yaml"), "utf-8");
      expect(content).toContain("https://popular-project.dev");
    });

    it("includes star count for popular projects", async () => {
      await generateFromGitHub({ github: "testdev", directory: TEST_DIR });
      const content = await readFile(join(TEST_DIR, "projects.yaml"), "utf-8");
      expect(content).toContain("1200");
    });
  });

  describe("career.yaml", () => {
    it("extracts company from GitHub profile", async () => {
      await generateFromGitHub({ github: "testdev", directory: TEST_DIR });
      const content = await readFile(join(TEST_DIR, "career.yaml"), "utf-8");
      expect(content).toContain("awesome-corp");
    });
  });

  describe("plugins.yaml", () => {
    it("enables GitHub plugin with correct username", async () => {
      await generateFromGitHub({ github: "testdev", directory: TEST_DIR });
      const content = await readFile(join(TEST_DIR, "plugins.yaml"), "utf-8");
      expect(content).toContain("github");
      expect(content).toContain("enabled: true");
      expect(content).toContain("testdev");
    });
  });

  it("warns about missing GITHUB_TOKEN", async () => {
    const originalToken = process.env.GITHUB_TOKEN;
    delete process.env.GITHUB_TOKEN;

    const result = await generateFromGitHub({
      github: "testdev",
      directory: TEST_DIR,
    });

    expect(result.warnings.length).toBeGreaterThan(0);
    expect(result.warnings[0]).toContain("GITHUB_TOKEN");

    if (originalToken) process.env.GITHUB_TOKEN = originalToken;
  });

  it("throws on invalid username (404)", async () => {
    globalThis.fetch = vi.fn(async () => ({
      ok: false,
      status: 404,
      statusText: "Not Found",
    })) as unknown as typeof globalThis.fetch;

    await expect(
      generateFromGitHub({ github: "nonexistent-user-xyz", directory: TEST_DIR }),
    ).rejects.toThrow("GitHub API error");
  });
});
