import { describe, it, expect, vi } from "vitest";
import { z } from "zod";
import type { McpMePlugin } from "../src/plugin-engine/types.js";
import { discoverPlugins } from "../src/plugin-engine/loader.js";

function createMockPlugin(name: string): McpMePlugin {
  return {
    name,
    description: `Mock ${name} plugin`,
    version: "0.1.0",
    initialize: async () => {},
    getResources: () => [
      {
        name: `${name}-resource`,
        uri: `me://${name}/data`,
        title: `${name} Data`,
        description: `Data from ${name}`,
        read: async () => JSON.stringify({ source: name }),
      },
    ],
    getTools: () => [
      {
        name: `get_${name}_data`,
        title: `Get ${name} Data`,
        description: `Fetch data from ${name}`,
        inputSchema: z.object({}),
        annotations: { readOnlyHint: true },
        execute: async () => JSON.stringify({ result: "ok" }),
      },
    ],
  };
}

describe("McpMePlugin interface", () => {
  it("creates a valid plugin", () => {
    const plugin = createMockPlugin("test");
    expect(plugin.name).toBe("test");
    expect(plugin.version).toBe("0.1.0");
  });

  it("returns resources", () => {
    const plugin = createMockPlugin("test");
    const resources = plugin.getResources();
    expect(resources).toHaveLength(1);
    expect(resources[0].uri).toBe("me://test/data");
  });

  it("returns tools", () => {
    const plugin = createMockPlugin("test");
    const tools = plugin.getTools();
    expect(tools).toHaveLength(1);
    expect(tools[0].name).toBe("get_test_data");
  });

  it("resource read returns data", async () => {
    const plugin = createMockPlugin("test");
    const data = await plugin.getResources()[0].read();
    expect(JSON.parse(data)).toEqual({ source: "test" });
  });

  it("tool execute returns data", async () => {
    const plugin = createMockPlugin("test");
    const result = await plugin.getTools()[0].execute({});
    expect(JSON.parse(result)).toEqual({ result: "ok" });
  });
});

describe("discoverPlugins", () => {
  it("returns empty array for empty config", async () => {
    const plugins = await discoverPlugins({});
    expect(plugins).toEqual([]);
  });

  it("skips disabled plugins", async () => {
    const plugins = await discoverPlugins({
      github: { enabled: false, username: "test" },
    });
    expect(plugins).toEqual([]);
  });

  it("warns about missing plugins", async () => {
    const consoleSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    const plugins = await discoverPlugins({
      nonexistent: { enabled: true },
    });
    expect(plugins).toEqual([]);
    expect(consoleSpy).toHaveBeenCalled();
    consoleSpy.mockRestore();
  });
});
