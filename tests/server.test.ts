import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { mkdir, writeFile, rm } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { createMcpMeServer } from "../src/server.js";

const TEST_DIR = join(tmpdir(), "mcp-me-server-test-" + Date.now());

beforeEach(async () => {
  await mkdir(TEST_DIR, { recursive: true });
  await writeFile(
    join(TEST_DIR, "identity.yaml"),
    'name: "Test User"\nbio: "A test profile for unit tests."',
  );
  await writeFile(
    join(TEST_DIR, "skills.yaml"),
    'technical:\n  - name: "TypeScript"\n    proficiency: "advanced"\n    years: 5',
  );
  await writeFile(
    join(TEST_DIR, "faq.yaml"),
    'items:\n  - question: "What do you do?"\n    answer: "I write tests."',
  );
  await writeFile(
    join(TEST_DIR, "projects.yaml"),
    'projects:\n  - name: "mcp-me"\n    description: "Personal MCP server"',
  );
});

afterEach(async () => {
  await rm(TEST_DIR, { recursive: true, force: true });
});

describe("createMcpMeServer", () => {
  it("creates a server instance", async () => {
    const server = await createMcpMeServer(TEST_DIR);
    expect(server).toBeDefined();
  });

  it("works with empty profile directory", async () => {
    const emptyDir = join(tmpdir(), "mcp-me-empty-" + Date.now());
    await mkdir(emptyDir, { recursive: true });
    try {
      const server = await createMcpMeServer(emptyDir);
      expect(server).toBeDefined();
    } finally {
      await rm(emptyDir, { recursive: true, force: true });
    }
  });

  it("works with missing plugins.yaml", async () => {
    const server = await createMcpMeServer(TEST_DIR);
    expect(server).toBeDefined();
  });
});
