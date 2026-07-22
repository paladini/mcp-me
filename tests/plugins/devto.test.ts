import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import createDevToPlugin from "../../src/plugins/devto/index.js";

const MOCK_ARTICLES = [
  {
    id: 1,
    title: "Test Article",
    description: "Description",
    url: "https://dev.to/u/test",
    published_at: "2024-01-01T00:00:00Z",
    positive_reactions_count: 5,
    comments_count: 1,
    reading_time_minutes: 2,
    tag_list: ["test"],
  },
];

describe("devto plugin", () => {
  beforeEach(() => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => ({
        ok: true,
        json: async () => MOCK_ARTICLES,
      })),
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("returns articles from get_devto_articles tool", async () => {
    const plugin = createDevToPlugin();
    await plugin.initialize({ username: "testuser" });

    const tools = plugin.getTools();
    const getLatest = tools.find((t) => t.name === "get_devto_latest");
    expect(getLatest).toBeDefined();

    const result = await getLatest!.execute({});
    const parsed = JSON.parse(result) as { title: string }[];
    expect(parsed[0].title).toBe("Test Article");
  });
});
