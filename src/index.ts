/**
 * Programmatic API for building MCP hosts, generators, and profile tooling on top of mcp-me.
 *
 * @module
 */

// Public API: Only expose what is needed for consumers
export { createMcpMeServer } from "./server.js";
export { loadProfile, loadPluginsConfig, loadGeneratorsConfig, loadConfig, searchProfile } from "./loader.js";
export { PROFILE_CATEGORIES, profileSchemaMap } from "./schema/index.js";
export { discoverPlugins } from "./plugin-engine/index.js";
export { generateProfile } from "./generator.js";
export { mergeProfiles } from "./generators/merger.js";

// Types
export type { McpMeConfig } from "./loader.js";
export type { ProfileCategory } from "./schema/index.js";
export type { McpMePlugin, McpMePluginFactory, PluginResource, PluginTool, PluginPrompt } from "./plugin-engine/types.js";
export type { GenerateOptions, GenerateResult } from "./generator.js";
export { resolveProfileDir, getDefaultProfileDir, PROFILE_DIR_ENV } from "./profile-dir.js";
