/**
 * Universal Plugin Test Harness
 *
 * Automatically validates every built-in plugin for structural correctness.
 * Adding a new plugin to BUILTIN_REGISTRY in src/plugin-engine/loader.ts is
 * all that's needed — this harness imports the registry directly and verifies
 * every entry conforms to the McpMePlugin interface.
 */
import { describe, it, expect } from "vitest";
import { readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import os from "node:os";
import { BUILTIN_REGISTRY } from "../../src/plugin-engine/loader.js";
import type { McpMePlugin } from "../../src/plugin-engine/types.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const PLUGINS_DIR = join(__dirname, "../../src/plugins");

/**
 * Minimal config objects to satisfy Zod schemas during initialize().
 * These are just enough to pass validation — no real API calls are made.
 */
const MINIMAL_CONFIGS: Record<string, Record<string, unknown>> = {
  github: { username: "test-user" },
  spotify: { client_id_env: "SPOTIFY_ID", client_secret_env: "SPOTIFY_SECRET", refresh_token_env: "SPOTIFY_REFRESH" },
  linkedin: { data_path: join(os.tmpdir(), "linkedin.json") },
  wakatime: { username: "test-user" },
  devto: { username: "test-user" },
  bluesky: { handle: "test.bsky.social" },
  hackernews: { username: "test-user" },
  reddit: { username: "test-user" },
  gitlab: { username: "test-user" },
  mastodon: { handle: "test@mastodon.social" },
  youtube: { channel_id: "UCtest123" },
  lastfm: { username: "test-user" },
  steam: { steam_id: "76561198000000000" },
};

/** Create and initialize a plugin with minimal config for structural testing. */
async function createInitializedPlugin(name: string): Promise<McpMePlugin> {
  const plugin = BUILTIN_REGISTRY[name]();
  await plugin.initialize(MINIMAL_CONFIGS[name] ?? {});
  return plugin;
}

describe("Plugin Harness — structural validation", () => {
  it("has at least one built-in plugin", () => {
    expect(Object.keys(BUILTIN_REGISTRY).length).toBeGreaterThan(0);
  });

  describe.each(Object.entries(BUILTIN_REGISTRY))("%s", (_name, factory) => {
    it("factory returns a valid plugin object", () => {
      const plugin = factory();
      expect(plugin).toBeDefined();
      expect(typeof plugin.name).toBe("string");
      expect(plugin.name.length).toBeGreaterThan(0);
    });

    it("has a non-empty description", () => {
      const plugin = factory();
      expect(typeof plugin.description).toBe("string");
      expect(plugin.description.length).toBeGreaterThan(0);
    });

    it("has a valid semver version", () => {
      const plugin = factory();
      expect(typeof plugin.version).toBe("string");
      expect(plugin.version).toMatch(/^\d+\.\d+\.\d+/);
    });

    it("has an initialize function", () => {
      const plugin = factory();
      expect(typeof plugin.initialize).toBe("function");
    });

    it("initialize succeeds with minimal config", async () => {
      const plugin = await createInitializedPlugin(_name);
      expect(plugin).toBeDefined();
    });

    it("getResources returns an array after init", async () => {
      const plugin = await createInitializedPlugin(_name);
      const resources = plugin.getResources();
      expect(Array.isArray(resources)).toBe(true);
    });

    it("getTools returns an array after init", async () => {
      const plugin = await createInitializedPlugin(_name);
      const tools = plugin.getTools();
      expect(Array.isArray(tools)).toBe(true);
    });

    it("resources have required fields", async () => {
      const plugin = await createInitializedPlugin(_name);
      for (const resource of plugin.getResources()) {
        expect(typeof resource.name).toBe("string");
        expect(resource.name.length).toBeGreaterThan(0);
        expect(typeof resource.uri).toBe("string");
        expect(resource.uri).toMatch(/^me:\/\//);
        expect(typeof resource.title).toBe("string");
        expect(typeof resource.description).toBe("string");
        expect(typeof resource.read).toBe("function");
      }
    });

    it("tools have required fields", async () => {
      const plugin = await createInitializedPlugin(_name);
      for (const tool of plugin.getTools()) {
        expect(typeof tool.name).toBe("string");
        expect(tool.name.length).toBeGreaterThan(0);
        expect(typeof tool.title).toBe("string");
        expect(typeof tool.description).toBe("string");
        expect(tool.inputSchema).toBeDefined();
        expect(typeof tool.execute).toBe("function");
      }
    });
  });

  it("has no duplicate plugin names", () => {
    const names = Object.entries(BUILTIN_REGISTRY).map(([, f]) => f().name);
    expect(new Set(names).size).toBe(names.length);
  });
});

describe("Plugin Harness — directory registration check", () => {
  it("every plugin directory in src/plugins/ has a factory registered", () => {
    const dirs = readdirSync(PLUGINS_DIR, { withFileTypes: true })
      .filter((d) => d.isDirectory())
      .map((d) => d.name);

    const registered = new Set(Object.keys(BUILTIN_REGISTRY));
    const unregistered = dirs.filter((d) => !registered.has(d));
    expect(unregistered).toEqual([]);
  });

  it("total built-in plugin count matches expected", () => {
    // This test documents the current count and will break if plugins are
    // added to the registry or removed. Update this number when adding new plugins.
    expect(Object.keys(BUILTIN_REGISTRY).length).toBe(13);
  });
});
