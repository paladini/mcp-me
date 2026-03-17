#!/usr/bin/env node
import { Command } from "commander";
import { cp, mkdir, readdir, access } from "node:fs/promises";
import { join, resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { createMcpMeServer } from "./server.js";
import { loadProfile } from "./loader.js";
import { generateFromGitHub } from "./generator.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const program = new Command();

program
  .name("mcp-me")
  .description(
    "A community-driven MCP server that lets anyone expose personal information to AI assistants.",
  )
  .version("0.1.0");

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

program
  .command("generate")
  .description("Auto-generate a profile from your online presence (GitHub, etc.)")
  .argument("<directory>", "Directory to create the profile in")
  .option("--github <username>", "GitHub username to pull data from")
  .option("-f, --force", "Overwrite existing files", false)
  .action(async (directory: string, options: { github?: string; force: boolean }) => {
    const targetDir = resolve(directory);

    if (!options.github) {
      console.error("At least one data source is required. Use --github <username>");
      process.exit(1);
    }

    try {
      console.log("🚀 mcp-me generate — building your AI identity\n");

      const result = await generateFromGitHub({
        github: options.github,
        directory: targetDir,
        force: options.force,
      });

      if (result.warnings.length > 0) {
        console.log();
        result.warnings.forEach((w) => console.log(`  ⚠ ${w}`));
      }

      console.log();
      console.log(`  ✨ Profile generated for ${result.profile.name} (@${result.profile.username})`);
      console.log(`     ${result.profile.repos} repositories analyzed`);
      console.log(`     Top languages: ${result.profile.languages?.join(", ")}`);
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

program.parse();
