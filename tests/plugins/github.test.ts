import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import createGitHubPlugin from "../../src/plugins/github/index.js";
import type { McpMePlugin } from "../../src/plugin-engine/types.js";

const MOCK_USER = {
  login: "testuser",
  name: "Test User",
  bio: "A developer",
  public_repos: 42,
  followers: 100,
  following: 50,
  html_url: "https://github.com/testuser",
  blog: "https://testuser.dev",
  location: "San Francisco",
  company: "Acme Corp",
  created_at: "2020-01-01T00:00:00Z",
};

const MOCK_REPOS = [
  {
    name: "project-a",
    full_name: "testuser/project-a",
    description: "A cool project",
    html_url: "https://github.com/testuser/project-a",
    language: "TypeScript",
    stargazers_count: 120,
    forks_count: 15,
    fork: false,
    topics: ["mcp", "typescript"],
    created_at: "2023-01-01T00:00:00Z",
    updated_at: "2024-06-01T00:00:00Z",
    pushed_at: "2024-06-01T00:00:00Z",
  },
  {
    name: "project-b",
    full_name: "testuser/project-b",
    description: "A Python tool",
    html_url: "https://github.com/testuser/project-b",
    language: "Python",
    stargazers_count: 5,
    forks_count: 0,
    fork: false,
    topics: ["python"],
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-05-01T00:00:00Z",
    pushed_at: "2024-05-01T00:00:00Z",
  },
  {
    name: "forked-repo",
    full_name: "testuser/forked-repo",
    description: "A fork",
    html_url: "https://github.com/testuser/forked-repo",
    language: "JavaScript",
    stargazers_count: 0,
    forks_count: 0,
    fork: true,
    topics: [],
    created_at: "2024-02-01T00:00:00Z",
    updated_at: "2024-02-01T00:00:00Z",
    pushed_at: "2024-02-01T00:00:00Z",
  },
];

const MOCK_EVENTS = [
  { type: "PushEvent", repo: { name: "testuser/project-a" }, created_at: "2024-06-01T10:00:00Z", payload: {} },
  { type: "CreateEvent", repo: { name: "testuser/project-b" }, created_at: "2024-05-30T10:00:00Z", payload: {} },
];

function mockFetch(urlMap: [string, unknown][]) {
  return vi.fn(async (url: string) => {
    // Check patterns from most specific (longest) to least specific
    const sorted = [...urlMap].sort(([a], [b]) => b.length - a.length);
    for (const [pattern, data] of sorted) {
      if (url.includes(pattern)) {
        return { ok: true, json: async () => data };
      }
    }
    return { ok: false, status: 404, statusText: "Not Found" };
  });
}

describe("GitHub Plugin", () => {
  let plugin: McpMePlugin;
  let originalFetch: typeof globalThis.fetch;

  beforeEach(async () => {
    originalFetch = globalThis.fetch;
    globalThis.fetch = mockFetch([
      ["/users/testuser/repos", MOCK_REPOS],
      ["/users/testuser/events", MOCK_EVENTS],
      ["/users/testuser", MOCK_USER],
    ]) as unknown as typeof globalThis.fetch;

    plugin = createGitHubPlugin();
    await plugin.initialize({ enabled: true, username: "testuser" });
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  describe("initialization", () => {
    it("creates a plugin with correct metadata", () => {
      expect(plugin.name).toBe("github");
      expect(plugin.version).toBe("0.1.0");
      expect(plugin.description).toContain("GitHub");
    });
  });

  describe("resources", () => {
    it("provides 4 resources", () => {
      const resources = plugin.getResources();
      expect(resources).toHaveLength(4);
    });

    it("has correct URIs", () => {
      const uris = plugin.getResources().map((r) => r.uri);
      expect(uris).toContain("me://github/profile");
      expect(uris).toContain("me://github/repos");
      expect(uris).toContain("me://github/activity");
      expect(uris).toContain("me://github/languages");
    });

    it("reads profile data", async () => {
      const profileResource = plugin.getResources().find((r) => r.uri === "me://github/profile")!;
      const data = JSON.parse(await profileResource.read());
      expect(data.login).toBe("testuser");
      expect(data.name).toBe("Test User");
      expect(data.followers).toBe(100);
    });

    it("reads repos and excludes forks by default", async () => {
      const reposResource = plugin.getResources().find((r) => r.uri === "me://github/repos")!;
      const data = JSON.parse(await reposResource.read());
      expect(data).toHaveLength(2);
      expect(data.every((r: { name: string }) => r.name !== "forked-repo")).toBe(true);
    });

    it("reads activity", async () => {
      const activityResource = plugin.getResources().find((r) => r.uri === "me://github/activity")!;
      const data = JSON.parse(await activityResource.read());
      expect(data).toHaveLength(2);
      expect(data[0].type).toBe("PushEvent");
    });

    it("reads languages summary", async () => {
      const langResource = plugin.getResources().find((r) => r.uri === "me://github/languages")!;
      const data = JSON.parse(await langResource.read());
      expect(data).toHaveLength(2);
      expect(data[0].language).toBe("TypeScript");
      expect(data[0].repos).toBe(1);
    });
  });

  describe("tools", () => {
    it("provides 1 tool", () => {
      expect(plugin.getTools()).toHaveLength(1);
    });

    it("get_github_repos returns all non-fork repos", async () => {
      const tool = plugin.getTools()[0];
      expect(tool.name).toBe("get_github_repos");
      const result = JSON.parse(await tool.execute({}));
      expect(result).toHaveLength(2);
    });

    it("get_github_repos filters by language", async () => {
      const tool = plugin.getTools()[0];
      const result = JSON.parse(await tool.execute({ language: "python" }));
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe("project-b");
    });

    it("get_github_repos filters by min_stars", async () => {
      const tool = plugin.getTools()[0];
      const result = JSON.parse(await tool.execute({ min_stars: 10 }));
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe("project-a");
    });
  });

  describe("include_forks option", () => {
    it("includes forks when enabled", async () => {
      const forkPlugin = createGitHubPlugin();
      await forkPlugin.initialize({ enabled: true, username: "testuser", include_forks: true });
      const reposResource = forkPlugin.getResources().find((r) => r.uri === "me://github/repos")!;
      const data = JSON.parse(await reposResource.read());
      expect(data).toHaveLength(3);
    });
  });
});
