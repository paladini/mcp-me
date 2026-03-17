import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { mkdir, writeFile, rm } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { loadProfile, loadProfileFile, loadPluginsConfig, searchProfile, validateYaml } from "../src/loader.js";
import { identitySchema } from "../src/schema/index.js";

const TEST_DIR = join(tmpdir(), "mcp-me-test-" + Date.now());

beforeEach(async () => {
  await mkdir(TEST_DIR, { recursive: true });
});

afterEach(async () => {
  await rm(TEST_DIR, { recursive: true, force: true });
});

describe("loadProfileFile", () => {
  it("loads and validates a valid identity file", async () => {
    const content = `
name: "John Doe"
bio: "A software engineer."
`;
    await writeFile(join(TEST_DIR, "identity.yaml"), content);
    const result = await loadProfileFile(join(TEST_DIR, "identity.yaml"), "identity");
    expect(result.valid).toBe(true);
    expect(result.data).toBeDefined();
    expect((result.data as Record<string, unknown>).name).toBe("John Doe");
  });

  it("returns valid with null data for missing files", async () => {
    const result = await loadProfileFile(join(TEST_DIR, "identity.yaml"), "identity");
    expect(result.valid).toBe(true);
    expect(result.data).toBeNull();
  });

  it("returns errors for invalid YAML content", async () => {
    const content = `
name: 123
`;
    await writeFile(join(TEST_DIR, "identity.yaml"), content);
    const result = await loadProfileFile(join(TEST_DIR, "identity.yaml"), "identity");
    expect(result.valid).toBe(false);
    expect(result.errors).toBeDefined();
    expect(result.errors!.length).toBeGreaterThan(0);
  });
});

describe("loadProfile", () => {
  it("loads a complete profile directory", async () => {
    await writeFile(
      join(TEST_DIR, "identity.yaml"),
      'name: "Jane"\nbio: "Engineer"',
    );
    await writeFile(
      join(TEST_DIR, "skills.yaml"),
      'technical:\n  - name: "TypeScript"\n    proficiency: "advanced"',
    );

    const bundle = await loadProfile(TEST_DIR);
    expect(bundle.valid).toBe(true);
    expect(bundle.data.identity).toBeDefined();
    expect(bundle.data.skills).toBeDefined();
  });

  it("handles empty profile directory", async () => {
    const bundle = await loadProfile(TEST_DIR);
    expect(bundle.valid).toBe(true);
    expect(Object.keys(bundle.data)).toHaveLength(0);
  });

  it("reports errors for invalid files", async () => {
    await writeFile(join(TEST_DIR, "identity.yaml"), "name: 123");
    const bundle = await loadProfile(TEST_DIR);
    expect(bundle.valid).toBe(false);
    expect(bundle.errors.length).toBeGreaterThan(0);
  });
});

describe("loadPluginsConfig", () => {
  it("loads plugins config", async () => {
    const content = `
plugins:
  github:
    enabled: true
    username: "testuser"
`;
    await writeFile(join(TEST_DIR, "plugins.yaml"), content);
    const config = await loadPluginsConfig(TEST_DIR);
    expect(config.github).toBeDefined();
    expect(config.github.username).toBe("testuser");
  });

  it("returns empty object for missing file", async () => {
    const config = await loadPluginsConfig(TEST_DIR);
    expect(config).toEqual({});
  });
});

describe("validateYaml", () => {
  it("validates correct YAML", () => {
    const result = validateYaml('name: "John"\nbio: "Test"', identitySchema);
    expect(result.valid).toBe(true);
  });

  it("returns errors for invalid YAML", () => {
    const result = validateYaml("name: 123", identitySchema);
    expect(result.valid).toBe(false);
    expect(result.errors).toBeDefined();
  });
});

describe("searchProfile", () => {
  it("finds matching strings", () => {
    const data = {
      identity: { name: "John Doe", bio: "Software engineer from Brazil" },
      skills: { technical: [{ name: "TypeScript" }, { name: "Python" }] },
    };
    const results = searchProfile(data, "typescript");
    expect(results.length).toBe(1);
    expect(results[0]).toContain("TypeScript");
  });

  it("searches case-insensitively", () => {
    const data = { identity: { name: "John Doe" } };
    const results = searchProfile(data, "john");
    expect(results.length).toBe(1);
  });

  it("returns empty for no matches", () => {
    const data = { identity: { name: "John" } };
    const results = searchProfile(data, "xyz");
    expect(results).toHaveLength(0);
  });

  it("searches nested arrays", () => {
    const data = {
      interests: { hobbies: ["Reading", "Hiking", "Photography"] },
    };
    const results = searchProfile(data, "hiking");
    expect(results.length).toBe(1);
  });
});
