import { resolve } from "node:path";
import type { McpMePlugin, McpMePluginFactory } from "./types.js";
import createGitHubPlugin from "../plugins/github/index.js";
import createSpotifyPlugin from "../plugins/spotify/index.js";
import createLinkedInPlugin from "../plugins/linkedin/index.js";

/** Registry of built-in plugins with explicit imports (avoids dynamic import bundling issues). */
const BUILTIN_REGISTRY: Record<string, McpMePluginFactory> = {
  github: createGitHubPlugin,
  spotify: createSpotifyPlugin,
  linkedin: createLinkedInPlugin,
};

/**
 * Load a built-in plugin by name.
 */
function loadBuiltinPlugin(name: string): McpMePlugin | null {
  const factory = BUILTIN_REGISTRY[name];
  if (!factory) return null;

  try {
    return factory();
  } catch (error) {
    console.error(`Failed to load built-in plugin "${name}":`, (error as Error).message);
    return null;
  }
}

/**
 * Load an npm-installed community plugin (mcp-me-plugin-*).
 */
async function loadNpmPlugin(name: string): Promise<McpMePlugin | null> {
  const packageName = `mcp-me-plugin-${name}`;
  try {
    const mod = await import(packageName);
    const factory: McpMePluginFactory = mod.default ?? mod.createPlugin;
    if (typeof factory !== "function") {
      console.error(`npm plugin "${packageName}" does not export a factory function.`);
      return null;
    }
    return factory();
  } catch {
    return null;
  }
}

/**
 * Load a local plugin from a file path.
 */
async function loadLocalPlugin(filePath: string): Promise<McpMePlugin | null> {
  try {
    const absolutePath = resolve(filePath);
    const mod = await import(absolutePath);
    const factory: McpMePluginFactory = mod.default ?? mod.createPlugin;
    if (typeof factory !== "function") {
      console.error(`Local plugin "${filePath}" does not export a factory function.`);
      return null;
    }
    return factory();
  } catch (error) {
    console.error(`Failed to load local plugin "${filePath}":`, (error as Error).message);
    return null;
  }
}

/**
 * Discover and load all enabled plugins based on the plugins.yaml config.
 *
 * Loading order:
 * 1. Built-in plugins from src/plugins/
 * 2. npm packages named mcp-me-plugin-*
 * 3. Local files referenced by path
 */
export async function discoverPlugins(
  pluginsConfig: Record<string, Record<string, unknown>>,
): Promise<McpMePlugin[]> {
  const plugins: McpMePlugin[] = [];

  for (const [name, config] of Object.entries(pluginsConfig)) {
    if (config.enabled === false) {
      continue;
    }

    let plugin: McpMePlugin | null = null;

    // 1. Try built-in
    if (name in BUILTIN_REGISTRY) {
      plugin = loadBuiltinPlugin(name);
    }

    // 2. Try npm package
    if (!plugin) {
      plugin = await loadNpmPlugin(name);
    }

    // 3. Try local path
    if (!plugin && typeof config.path === "string") {
      plugin = await loadLocalPlugin(config.path);
    }

    if (plugin) {
      try {
        await plugin.initialize(config);
        plugins.push(plugin);
      } catch (error) {
        console.error(`Failed to initialize plugin "${name}":`, (error as Error).message);
      }
    } else {
      console.warn(
        `Plugin "${name}" not found. Install it with: npm install mcp-me-plugin-${name}`,
      );
    }
  }

  return plugins;
}
