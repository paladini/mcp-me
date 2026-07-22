import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import createWakaTimePlugin from "../../src/plugins/wakatime/index.js";

const MOCK_STATS = {
  data: {
    grand_total: { text: "2 hrs" },
    languages: [{ name: "TypeScript", text: "1 hr 12 mins" }],
    projects: [{ name: "mcp-me", text: "45 mins" }],
  },
};

describe("wakatime plugin", () => {
  beforeEach(() => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async (url: string) => {
        if (url.includes("wakatime.com")) {
          return { ok: true, json: async () => MOCK_STATS };
        }
        return { ok: false, status: 404, statusText: "Not Found" };
      }),
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("returns stats from get_wakatime_stats tool", async () => {
    const plugin = createWakaTimePlugin();
    await plugin.initialize({ username: "testuser" });

    const tools = plugin.getTools();
    const getToday = tools.find((t) => t.name === "get_wakatime_today");
    expect(getToday).toBeDefined();

    const result = await getToday!.execute({});
    const parsed = JSON.parse(result) as { total: string };
    expect(parsed.total).toBe("2 hrs");
  });
});
