# Creating Plugins for mcp-me

This guide walks you through building a community plugin for mcp-me. Plugins extend the MCP server with dynamic data from external services.

## Plugin Types

1. **Built-in plugins** — Shipped with mcp-me (GitHub, Spotify, LinkedIn)
2. **npm plugins** — Community packages named `mcp-me-plugin-<name>`
3. **Local plugins** — Custom `.ts`/`.js` files referenced by path

## The Plugin Interface

Every plugin must implement the `McpMePlugin` interface:

```ts
import type { McpMePlugin, PluginResource, PluginTool, PluginPrompt } from "mcp-me";

export interface McpMePlugin {
  // Unique identifier, e.g. "goodreads"
  name: string;

  // Human-readable description
  description: string;

  // Semver version string
  version: string;

  // Called once with user config from plugins.yaml
  initialize(config: Record<string, unknown>): Promise<void>;

  // MCP Resources this plugin exposes
  getResources(): PluginResource[];

  // MCP Tools this plugin provides
  getTools(): PluginTool[];

  // Optional: MCP Prompts
  getPrompts?(): PluginPrompt[];

  // Optional: cleanup on server shutdown
  destroy?(): Promise<void>;
}
```

## Step-by-Step: Building an npm Plugin

### 1. Create the package

```bash
mkdir mcp-me-plugin-goodreads
cd mcp-me-plugin-goodreads
npm init -y
npm install mcp-me zod
npm install -D typescript @types/node tsup
```

Update `package.json`:

```json
{
  "name": "mcp-me-plugin-goodreads",
  "version": "0.1.0",
  "type": "module",
  "main": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "keywords": ["mcp-me", "mcp-me-plugin", "goodreads"],
  "peerDependencies": {
    "mcp-me": ">=0.1.0"
  }
}
```

> **Important:** Use `mcp-me` as a `peerDependency`, not a regular dependency.

### 2. Define your config schema

```ts
// src/schema.ts
import { z } from "zod";

export const goodreadsConfigSchema = z.object({
  enabled: z.boolean().optional().default(true),
  user_id: z.string().describe("Your Goodreads user ID"),
  api_key_env: z.string().optional().describe("Env var for Goodreads API key"),
});

export type GoodreadsConfig = z.infer<typeof goodreadsConfigSchema>;
```

### 3. Implement the plugin

```ts
// src/index.ts
import { z } from "zod";
import type { McpMePlugin, PluginResource, PluginTool } from "mcp-me";
import { goodreadsConfigSchema, type GoodreadsConfig } from "./schema.js";

class GoodreadsPlugin implements McpMePlugin {
  name = "goodreads";
  description = "Shows reading list and book reviews from Goodreads.";
  version = "0.1.0";

  private config!: GoodreadsConfig;

  async initialize(rawConfig: Record<string, unknown>): Promise<void> {
    this.config = goodreadsConfigSchema.parse(rawConfig);
  }

  getResources(): PluginResource[] {
    return [
      {
        name: "goodreads-reading-list",
        uri: "me://goodreads/reading-list",
        title: "Reading List",
        description: "Current reading list from Goodreads",
        read: async () => {
          // Fetch from Goodreads API or scrape
          const books = await this.fetchReadingList();
          return JSON.stringify(books, null, 2);
        },
      },
    ];
  }

  getTools(): PluginTool[] {
    return [
      {
        name: "get_goodreads_books",
        title: "Get Books",
        description: "Get books from a specific shelf",
        inputSchema: z.object({
          shelf: z.string().optional().describe("Shelf name, e.g. 'read', 'to-read'"),
        }),
        annotations: { readOnlyHint: true },
        execute: async (input) => {
          const shelf = (input.shelf as string) ?? "read";
          const books = await this.fetchShelf(shelf);
          return JSON.stringify(books, null, 2);
        },
      },
    ];
  }

  private async fetchReadingList() {
    // Your implementation here
    return [];
  }

  private async fetchShelf(_shelf: string) {
    // Your implementation here
    return [];
  }
}

// IMPORTANT: Export a default factory function
export default function createPlugin(): McpMePlugin {
  return new GoodreadsPlugin();
}
```

### 4. Export a factory function

Your plugin's main entry point **must** export a default function (or named `createPlugin`) that returns a `McpMePlugin` instance:

```ts
// ✅ Correct
export default function createPlugin(): McpMePlugin {
  return new MyPlugin();
}

// ✅ Also correct
export function createPlugin(): McpMePlugin {
  return new MyPlugin();
}

// ❌ Wrong — don't export a class or instance directly
export default new MyPlugin();
```

### 5. Build and publish

```bash
npx tsup src/index.ts --format esm --dts
npm publish
```

### 6. Users install and configure

```bash
npm install mcp-me-plugin-goodreads
```

```yaml
# plugins.yaml
plugins:
  goodreads:
    enabled: true
    user_id: "12345"
```

The plugin is automatically discovered via the `mcp-me-plugin-` naming convention.

## Plugin Resources

Resources expose static or semi-static data. They should not perform heavy computation.

```ts
interface PluginResource {
  name: string;           // Unique name, e.g. "goodreads-reading-list"
  uri: string;            // URI pattern: "me://<plugin>/<resource>"
  title: string;          // Human-readable title
  description: string;    // What this resource provides
  mimeType?: string;      // Default: "application/json"
  read: () => Promise<string>;  // Returns the resource content
}
```

**URI convention:** Always use `me://<plugin-name>/<resource-name>`.

## Plugin Tools

Tools perform actions or queries. They accept input and return text.

```ts
interface PluginTool {
  name: string;           // Unique name, e.g. "get_goodreads_books"
  title: string;          // Human-readable title
  description: string;    // What this tool does
  inputSchema: z.ZodType; // Zod schema for input validation
  annotations?: {         // Behavioral hints
    readOnlyHint?: boolean;
    destructiveHint?: boolean;
    idempotentHint?: boolean;
  };
  execute: (input: Record<string, unknown>) => Promise<string>;
}
```

**Naming convention:** Use `snake_case` prefixed with your plugin context, e.g. `get_goodreads_books`.

## Plugin Prompts

Prompts are optional reusable templates.

```ts
interface PluginPrompt {
  name: string;
  title: string;
  description: string;
  argsSchema?: z.ZodType;
  generate: (args: Record<string, unknown>) => { role: "user" | "assistant"; content: string }[];
}
```

## Best Practices

1. **Validate config with Zod** — Always parse user config through a Zod schema in `initialize()`
2. **Use `_env` suffix for secrets** — Reference environment variables, never store secrets in YAML
3. **Handle errors gracefully** — Return meaningful error messages, don't crash the server
4. **Cache when possible** — Avoid excessive API calls; cache responses with a reasonable TTL
5. **Be read-only** — Set `readOnlyHint: true` on tools that don't modify external state
6. **Document everything** — Include a `README.md` with config options, required permissions, and examples
7. **Use semantic versioning** — Follow semver for your plugin versions
8. **Add the `mcp-me-plugin` keyword** — Helps with npm discoverability

## Local Development

You can test your plugin locally without publishing:

```yaml
# plugins.yaml
plugins:
  my-plugin:
    enabled: true
    path: "/absolute/path/to/my-plugin/dist/index.js"
    # ... your config options
```

## Need Help?

- Open an [issue](https://github.com/paladini/mcp-me/issues) with the `plugin-request` label
- Check existing [built-in plugins](https://github.com/paladini/mcp-me/tree/main/src/plugins) for reference
- Join the discussion in [GitHub Discussions](https://github.com/paladini/mcp-me/discussions)
