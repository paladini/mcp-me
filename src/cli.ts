import { Command } from "commander";
import { cp, mkdir, readdir, access, writeFile } from "node:fs/promises";
import { join, resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { createMcpMeServer } from "./server.js";
import { loadProfile, loadGeneratorsConfig } from "./loader.js";
import { generateProfile } from "./generator.js";
import { generators } from "./generators/index.js";
import { version } from "../package.json";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const program = new Command();

program
  .name("mcp-me")
  .description(
    "A community-driven MCP server that lets anyone expose personal information to AI assistants.",
  )
  .version(version);

program
  .command("init")
  .description("Initialize a new profile directory with YAML templates")
  .argument("<directory>", "Directory to create the profile in")
  .option("-f, --force", "Overwrite existing files", false)
  .action(async (directory: string, options: { force: boolean }) => {
    const targetDir = resolve(directory);
    const templatesDir = join(__dirname, "..", "templates");

    try {
      await mkdir(targetDir, { recursive: true });

      const templates = await readdir(templatesDir);
      let copied = 0;
      let skipped = 0;

      for (const file of templates) {
        const targetFile = join(targetDir, file);

        if (!options.force) {
          try {
            await access(targetFile);
            console.log(`  Skipped: ${file} (already exists, use --force to overwrite)`);
            skipped++;
            continue;
          } catch {
            // File doesn't exist, proceed
          }
        }

        await cp(join(templatesDir, file), targetFile);
        console.log(`  Created: ${file}`);
        copied++;
      }

      console.log();
      console.log(`Profile initialized in ${targetDir}`);
      console.log(`  ${copied} file(s) created, ${skipped} file(s) skipped`);
      console.log();
      console.log("Next steps:");
      console.log(`  1. Edit the YAML files in ${targetDir}`);
      console.log(`  2. Run: mcp-me validate ${directory}`);
      console.log(`  3. Run: mcp-me serve ${directory}`);
    } catch (error) {
      console.error(`Failed to initialize profile: ${(error as Error).message}`);
      process.exit(1);
    }
  });

program
  .command("serve")
  .description("Start the MCP server for your profile")
  .argument("<directory>", "Profile directory to serve")
  .action(async (directory: string) => {
    const profileDir = resolve(directory);

    try {
      await access(profileDir);
    } catch {
      console.error(`Profile directory not found: ${profileDir}`);
      console.error(`Run "mcp-me init ${directory}" first.`);
      process.exit(1);
    }

    try {
      const server = await createMcpMeServer(profileDir);
      const transport = new StdioServerTransport();
      await server.connect(transport);
      console.error("mcp-me server running on stdio");
    } catch (error) {
      console.error(`Failed to start server: ${(error as Error).message}`);
      process.exit(1);
    }
  });

program
  .command("validate")
  .description("Validate profile YAML files against schemas")
  .argument("<directory>", "Profile directory to validate")
  .action(async (directory: string) => {
    const profileDir = resolve(directory);

    try {
      await access(profileDir);
    } catch {
      console.error(`Profile directory not found: ${profileDir}`);
      process.exit(1);
    }

    const profile = await loadProfile(profileDir);
    let hasErrors = false;

    for (const result of profile.results) {
      if (result.data === null && result.valid) {
        console.log(`  [ ] ${result.category}.yaml — not found (optional)`);
      } else if (result.valid) {
        console.log(`  [✓] ${result.category}.yaml — valid`);
      } else {
        console.log(`  [✗] ${result.category}.yaml — invalid`);
        result.errors?.forEach((e) => console.log(`      ${e}`));
        hasErrors = true;
      }
    }

    console.log();
    if (hasErrors) {
      console.log("Validation failed. Fix the errors above and try again.");
      process.exit(1);
    } else {
      console.log("All profile files are valid!");
    }
  });

// Build generate command dynamically from the generators registry
const generateCmd = program
  .command("generate")
  .description("Auto-generate a profile from your online presence")
  .argument("<directory>", "Directory to create the profile in");

// Register CLI flags from generator metadata — no manual flag list needed
for (const g of generators) {
  generateCmd.option(`--${g.flag} ${g.flagArg}`, g.description);
}
generateCmd.option("-f, --force", "Overwrite existing files", false);

generateCmd.action(async (directory: string, options: Record<string, string | boolean | undefined>) => {
  const targetDir = resolve(directory);
  const { force, ...cliSources } = options;
  let hasSources = Object.values(cliSources).some(Boolean);

  // If no CLI flags given, try reading from .mcp-me.yaml
  let sources: Record<string, string | boolean | undefined> = { ...cliSources };
  if (!hasSources) {
    const configSources = await loadGeneratorsConfig(targetDir);
    if (Object.keys(configSources).length > 0) {
      console.log("  Reading sources from .mcp-me.yaml...\n");
      sources = { ...configSources };
      hasSources = true;
    }
  }

  if (!hasSources) {
    // Group generators by category for help output
    const byCategory: Record<string, string[]> = {};
    for (const g of generators) {
      (byCategory[g.category] ??= []).push(`--${g.flag}`);
    }
    console.error("No data sources found. Provide CLI flags or create .mcp-me.yaml in the profile directory.\n");
    console.error("Option 1 — CLI flags:");
    console.error("  mcp-me generate ./my-profile --github octocat --devto myuser\n");
    console.error("Option 2 — Config file (.mcp-me.yaml in your profile directory):");
    console.error("  generators:");
    console.error("    github: octocat");
    console.error("    devto: myuser\n");
    console.error("Available sources by category:");
    for (const [cat, flags] of Object.entries(byCategory)) {
      console.error(`  ${cat.padEnd(14)} ${flags.join(", ")}`);
    }
    process.exit(1);
  }

  try {
    console.log("🚀 mcp-me generate — building your AI identity\n");

    const result = await generateProfile({ directory: targetDir, ...sources, force: force as boolean });

    if (result.warnings.length > 0) {
      console.log();
      result.warnings.forEach((w: string) => console.log(`  ⚠ ${w}`));
    }

    console.log();
    console.log(`  ✨ Profile generated${result.summary.name ? ` for ${result.summary.name}` : ""}`);
    console.log(`     Sources: ${result.sources.join(", ")}`);
    if (result.summary.skills) console.log(`     Skills discovered: ${result.summary.skills}`);
    if (result.summary.projects) console.log(`     Projects found: ${result.summary.projects}`);
    console.log(`     ${result.filesCreated.length} files created in ${targetDir}`);
    console.log();
    console.log("  Next steps:");
    console.log(`    1. Review and edit the YAML files in ${targetDir}`);
    console.log(`    2. Run: mcp-me validate ${directory}`);
    console.log(`    3. Run: mcp-me serve ${directory}`);
  } catch (error) {
    console.error(`\n  ✗ Failed to generate profile: ${(error as Error).message}`);
    process.exit(1);
  }
});

// --- Scaffolding: mcp-me create generator/plugin ---
const createCmd = program
  .command("create")
  .description("Scaffold a new generator or plugin from a template");

createCmd
  .command("generator")
  .description("Create a new generator file with boilerplate code")
  .argument("<name>", "Generator name (e.g. myservice)")
  .option("-c, --category <category>", "Category: code, writing, community, packages, activity, identity", "community")
  .action(async (name: string, options: { category: string }) => {
    const fileName = name.toLowerCase().replace(/[^a-z0-9]/g, "");
    const className = fileName.charAt(0).toUpperCase() + fileName.slice(1);
    const filePath = join(__dirname, "..", "src", "generators", `${fileName}.ts`);

    try {
      await access(filePath);
      console.error(`Generator file already exists: src/generators/${fileName}.ts`);
      process.exit(1);
    } catch {
      // File doesn't exist — good
    }

    const template = `/**
 * ${className} Generator
 *
 * TODO: Describe what data this generator fetches.
 *
 * @flag --${fileName} <username>
 * @example mcp-me generate ./profile --${fileName} myuser
 * @auth None required (public API)
 * @api TODO: API documentation URL
 * @data identity, skills, projects, faq (update as needed)
 */
import type { GeneratorSource, PartialProfile } from "./types.js";

interface ${className}User {
  username: string;
  displayName: string;
  bio: string;
  // TODO: Add API response fields
}

export const ${fileName}Generator: GeneratorSource = {
  name: "${fileName}",
  flag: "${fileName}",
  flagArg: "<username>",
  description: "TODO: Short description for CLI help",
  category: "${options.category}",

  async generate(config): Promise<PartialProfile> {
    const username = config.username as string;
    if (!username) throw new Error("${className} username is required");

    console.log(\`  [${className}] Fetching profile for \${username}...\`);

    const resp = await fetch(\`https://api.example.com/users/\${username}\`, {
      headers: { Accept: "application/json", "User-Agent": "mcp-me-generator" },
    });
    if (!resp.ok) throw new Error(\`${className} API error: \${resp.status} \${resp.statusText}\`);
    const user = (await resp.json()) as ${className}User;

    console.log(\`  [${className}] Found: \${user.displayName}\`);

    return {
      identity: {
        name: user.displayName,
        bio: user.bio,
        contact: {
          social: [{ platform: "${fileName}", url: \`https://example.com/\${username}\`, username }],
        },
      },
      // TODO: Add skills, projects, faq as applicable
    };
  },
};
`;

    await writeFile(filePath, template, "utf-8");
    console.log(`  Created: src/generators/${fileName}.ts`);
    console.log();
    console.log("Next steps:");
    console.log(`  1. Edit src/generators/${fileName}.ts — implement the API calls`);
    console.log(`  2. Add to src/generators/index.ts:`);
    console.log(`     import { ${fileName}Generator } from "./${fileName}.js";`);
    console.log(`     // Then add ${fileName}Generator to the generators array`);
    console.log(`  3. Run: npm test (the generator harness will validate it automatically)`);
  });

createCmd
  .command("plugin")
  .description("Create a new plugin directory with boilerplate code")
  .argument("<name>", "Plugin name (e.g. myservice)")
  .action(async (name: string) => {
    const pluginName = name.toLowerCase().replace(/[^a-z0-9]/g, "");
    const className = pluginName.charAt(0).toUpperCase() + pluginName.slice(1);
    const pluginDir = join(__dirname, "..", "src", "plugins", pluginName);

    try {
      await access(pluginDir);
      console.error(`Plugin directory already exists: src/plugins/${pluginName}/`);
      process.exit(1);
    } catch {
      // Directory doesn't exist — good
    }

    await mkdir(pluginDir, { recursive: true });

    // schema.ts
    const schemaContent = `import { z } from "zod";

export const ${pluginName}PluginConfigSchema = z.object({
  enabled: z.boolean().optional().default(true),
  username: z.string().describe("${className} username"),
  // TODO: Add config fields (use _env suffix for secrets)
});

export type ${className}PluginConfig = z.infer<typeof ${pluginName}PluginConfigSchema>;
`;

    // index.ts
    const indexContent = `/**
 * ${className} Plugin
 *
 * TODO: Describe what live data this plugin provides.
 *
 * @config username: ${className} username
 */
import { z } from "zod";
import type { McpMePlugin, PluginResource, PluginTool } from "../../plugin-engine/types.js";
import { ${pluginName}PluginConfigSchema, type ${className}PluginConfig } from "./schema.js";

class ${className}Plugin implements McpMePlugin {
  name = "${pluginName}";
  description = "TODO: Plugin description.";
  version = "0.1.0";

  private config!: ${className}PluginConfig;

  async initialize(rawConfig: Record<string, unknown>): Promise<void> {
    this.config = ${pluginName}PluginConfigSchema.parse(rawConfig);
  }

  getResources(): PluginResource[] {
    return [
      {
        name: "${pluginName}-profile",
        uri: "me://${pluginName}/profile",
        title: "${className} Profile",
        description: \`${className} profile for \${this.config.username}\`,
        read: async () => {
          // TODO: Fetch live data from API
          return JSON.stringify({ username: this.config.username }, null, 2);
        },
      },
    ];
  }

  getTools(): PluginTool[] {
    return [
      {
        name: "get_${pluginName}_data",
        title: "Get ${className} Data",
        description: \`Get data from ${className} for \${this.config.username}\`,
        inputSchema: z.object({}),
        annotations: { readOnlyHint: true },
        execute: async () => {
          // TODO: Implement tool logic
          return JSON.stringify({ status: "ok" });
        },
      },
    ];
  }
}

export default function createPlugin(): McpMePlugin {
  return new ${className}Plugin();
}
`;

    await writeFile(join(pluginDir, "schema.ts"), schemaContent, "utf-8");
    await writeFile(join(pluginDir, "index.ts"), indexContent, "utf-8");

    console.log(`  Created: src/plugins/${pluginName}/schema.ts`);
    console.log(`  Created: src/plugins/${pluginName}/index.ts`);
    console.log();
    console.log("Next steps:");
    console.log(`  1. Edit src/plugins/${pluginName}/schema.ts — define your config fields`);
    console.log(`  2. Edit src/plugins/${pluginName}/index.ts — implement resources and tools`);
    console.log(`  3. Register in src/plugin-engine/loader.ts:`);
    console.log(`     import create${className}Plugin from "../plugins/${pluginName}/index.js";`);
    console.log(`     // Then add to BUILTIN_REGISTRY: ${pluginName}: create${className}Plugin`);
    console.log(`  4. Run: npm test (the plugin harness will validate it automatically)`);
  });

program.parse();
