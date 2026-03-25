import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { access, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { initProfileDirectory } from "../src/init-profile.js";

const ROOT_DIR = join(tmpdir(), `mcp-me-init-test-${Date.now()}`);
const TEMPLATES_DIR = join(ROOT_DIR, "templates");
const TARGET_DIR = join(ROOT_DIR, "target");

describe("initProfileDirectory", () => {
  beforeEach(async () => {
    await mkdir(join(TEMPLATES_DIR, ".github"), { recursive: true });
    await writeFile(join(TEMPLATES_DIR, "identity.yaml"), "name: test\n", "utf-8");
    await writeFile(join(TEMPLATES_DIR, ".github", "copilot-instructions.md"), "# test\n", "utf-8");
  });

  afterEach(async () => {
    await rm(ROOT_DIR, { recursive: true, force: true });
  });

  it("copies file and nested template directory", async () => {
    const result = await initProfileDirectory({
      targetDir: TARGET_DIR,
      templatesDir: TEMPLATES_DIR,
      logger: { log: () => {} },
    });

    expect(result.copied).toBe(2);
    expect(result.skipped).toBe(0);

    await expect(access(join(TARGET_DIR, "identity.yaml"))).resolves.toBeUndefined();
    await expect(access(join(TARGET_DIR, ".github", "copilot-instructions.md"))).resolves.toBeUndefined();
  });

  it("skips existing paths when force is false", async () => {
    await mkdir(join(TARGET_DIR, ".github"), { recursive: true });
    await writeFile(join(TARGET_DIR, "identity.yaml"), "name: existing\n", "utf-8");
    await writeFile(join(TARGET_DIR, ".github", "copilot-instructions.md"), "# existing\n", "utf-8");

    const result = await initProfileDirectory({
      targetDir: TARGET_DIR,
      templatesDir: TEMPLATES_DIR,
      force: false,
      logger: { log: () => {} },
    });

    expect(result.copied).toBe(0);
    expect(result.skipped).toBe(2);

    const identity = await readFile(join(TARGET_DIR, "identity.yaml"), "utf-8");
    const instructions = await readFile(join(TARGET_DIR, ".github", "copilot-instructions.md"), "utf-8");
    expect(identity).toContain("existing");
    expect(instructions).toContain("existing");
  });

  it("overwrites existing paths when force is true", async () => {
    await mkdir(join(TARGET_DIR, ".github"), { recursive: true });
    await writeFile(join(TARGET_DIR, "identity.yaml"), "name: existing\n", "utf-8");
    await writeFile(join(TARGET_DIR, ".github", "copilot-instructions.md"), "# existing\n", "utf-8");

    const result = await initProfileDirectory({
      targetDir: TARGET_DIR,
      templatesDir: TEMPLATES_DIR,
      force: true,
      logger: { log: () => {} },
    });

    expect(result.copied).toBe(2);
    expect(result.skipped).toBe(0);

    const identity = await readFile(join(TARGET_DIR, "identity.yaml"), "utf-8");
    const instructions = await readFile(join(TARGET_DIR, ".github", "copilot-instructions.md"), "utf-8");
    expect(identity).toContain("name: test");
    expect(instructions).toContain("# test");
  });
});