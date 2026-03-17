import { z } from "zod";

/**
 * A resource provided by a plugin, registered on the MCP server.
 */
export interface PluginResource {
  /** Unique name for this resource, e.g. "github-repos" */
  name: string;
  /** URI for the resource, e.g. "me://github/repos" */
  uri: string;
  /** Human-readable title */
  title: string;
  /** Description of what this resource provides */
  description: string;
  /** MIME type of the resource content */
  mimeType?: string;
  /** Function that returns the resource content as a string */
  read: () => Promise<string>;
}

/**
 * A tool provided by a plugin, registered on the MCP server.
 */
export interface PluginTool {
  /** Unique name for this tool, e.g. "get_github_repos" */
  name: string;
  /** Human-readable title */
  title: string;
  /** Description of what this tool does */
  description: string;
  /** Zod schema for input parameters */
  inputSchema: z.ZodType;
  /** Tool annotations for hinting behavior */
  annotations?: {
    readOnlyHint?: boolean;
    destructiveHint?: boolean;
    idempotentHint?: boolean;
  };
  /** Function that executes the tool and returns a text result */
  execute: (input: Record<string, unknown>) => Promise<string>;
}

/**
 * A prompt provided by a plugin, registered on the MCP server.
 */
export interface PluginPrompt {
  /** Unique name for this prompt */
  name: string;
  /** Human-readable title */
  title: string;
  /** Description of what this prompt does */
  description: string;
  /** Zod schema for prompt arguments */
  argsSchema?: z.ZodType;
  /** Function that generates prompt messages */
  generate: (args: Record<string, unknown>) => { role: "user" | "assistant"; content: string }[];
}

/**
 * The core plugin interface. Every mcp-me plugin must implement this contract.
 *
 * Plugins can be:
 * 1. Built-in — shipped with mcp-me in src/plugins/
 * 2. npm packages — community plugins named `mcp-me-plugin-*`
 * 3. Local files — custom .ts/.js files referenced by path in plugins.yaml
 */
export interface McpMePlugin {
  /** Unique plugin identifier, e.g. "github", "spotify" */
  name: string;

  /** Human-readable description */
  description: string;

  /** Plugin version (semver) */
  version: string;

  /** Initialize the plugin with user-provided config from plugins.yaml */
  initialize(config: Record<string, unknown>): Promise<void>;

  /** MCP Resources this plugin provides */
  getResources(): PluginResource[];

  /** MCP Tools this plugin provides */
  getTools(): PluginTool[];

  /** MCP Prompts this plugin provides (optional) */
  getPrompts?(): PluginPrompt[];

  /** Cleanup on shutdown (optional) */
  destroy?(): Promise<void>;
}

/**
 * Factory function type for creating a plugin instance.
 * npm and local plugins must export a default function matching this signature.
 */
export type McpMePluginFactory = () => McpMePlugin;
