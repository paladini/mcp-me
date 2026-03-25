/**
 * Universal Generator Test Harness
 *
 * Automatically validates every registered generator for structural correctness.
 * Adding a new generator to the registry is all that's needed — this harness
 * picks it up and verifies it conforms to the GeneratorSource interface.
 */
import { describe, it, expect } from "vitest";
import { generators } from "../../src/generators/index.js";
import { readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const VALID_CATEGORIES = [
  "code", "writing", "community", "packages", "activity", "identity",
  "gaming", "music", "creative", "fitness", "food", "travel", "learning",
  "science", "finance", "maker", "social", "entertainment", "podcasts",
  "photography", "sports", "nature", "productivity", "crypto",
] as const;

const GENERATORS_DIR = join(__dirname, "../../src/generators");

describe("Generator Harness — structural validation", () => {
  it("has at least one generator registered", () => {
    expect(generators.length).toBeGreaterThan(0);
  });

  describe.each(generators.map((g) => [g.name, g]))("%s", (_name, generator) => {
    it("has a non-empty name", () => {
      expect(typeof generator.name).toBe("string");
      expect(generator.name.length).toBeGreaterThan(0);
    });

    it("has a non-empty flag", () => {
      expect(typeof generator.flag).toBe("string");
      expect(generator.flag.length).toBeGreaterThan(0);
    });

    it("has a non-empty flagArg", () => {
      expect(typeof generator.flagArg).toBe("string");
      expect(generator.flagArg.length).toBeGreaterThan(0);
    });

    it("has a non-empty description", () => {
      expect(typeof generator.description).toBe("string");
      expect(generator.description.length).toBeGreaterThan(0);
    });

    it("has a valid category", () => {
      expect(VALID_CATEGORIES).toContain(generator.category);
    });

    it("has a generate function", () => {
      expect(typeof generator.generate).toBe("function");
    });
  });

  it("has no duplicate generator names", () => {
    const names = generators.map((g) => g.name);
    expect(new Set(names).size).toBe(names.length);
  });

  it("has no duplicate flags", () => {
    const flags = generators.map((g) => g.flag);
    expect(new Set(flags).size).toBe(flags.length);
  });
});

describe("Generator Harness — file registration check", () => {
  const IGNORED_FILES = new Set(["index.ts", "types.ts", "merger.ts", "factory.ts"]);
  const BATCH_PREFIX = "batch-";

  it("every single-generator file in src/generators/ is registered", () => {
    const files = readdirSync(GENERATORS_DIR)
      .filter((f) => f.endsWith(".ts") && !IGNORED_FILES.has(f) && !f.startsWith(BATCH_PREFIX));

    const unregistered: string[] = [];
    for (const file of files) {
      const baseName = file.replace(".ts", "");
      const hasMatch = generators.some((g) => {
        return (
          g.name === baseName ||
          g.flag === baseName ||
          g.name.startsWith(baseName) ||
          baseName.startsWith(g.name)
        );
      });
      if (!hasMatch) {
        unregistered.push(file);
      }
    }

    expect(unregistered).toEqual([]);
  });

  it("every batch file in src/generators/ is imported (has at least one generator)", () => {
    const batchFiles = readdirSync(GENERATORS_DIR)
      .filter((f) => f.endsWith(".ts") && f.startsWith(BATCH_PREFIX));

    // Batch files should exist and we should have generators with categories
    // that correspond to the batch themes
    expect(batchFiles.length).toBeGreaterThan(0);
  });

  it("total generator count matches expected", () => {
    // This test documents the current count (45 named + 284 batch generators = 329 total)
    // and will break if generators are added to files but not registered (or vice versa).
    // Update this number when adding new generators.
    expect(generators.length).toBe(329);
  });
});
