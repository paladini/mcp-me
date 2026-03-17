export { createMcpMeServer } from "./server.js";
export { loadProfile, loadPluginsConfig, searchProfile } from "./loader.js";
export { PROFILE_CATEGORIES, profileSchemaMap } from "./schema/index.js";
export type { ProfileCategory } from "./schema/index.js";
export type {
  McpMePlugin,
  McpMePluginFactory,
  PluginResource,
  PluginTool,
  PluginPrompt,
} from "./plugin-engine/index.js";
export { discoverPlugins } from "./plugin-engine/index.js";
export { generateFromGitHub } from "./generator.js";
