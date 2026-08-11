import { existsSync, readFileSync } from "node:fs";
import { dirname, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const docsDirectory = resolve(root, "docs");
const indexHtml = readFileSync(resolve(docsDirectory, "index.html"), "utf8");

function localAssetReferences(html: string): string[] {
  return Array.from(html.matchAll(/\b(?:href|src)=["']([^"']+)["']/g), ([, reference]) => reference)
    .filter((reference) => !/^(?:[a-z]+:|#|\/\/)/i.test(reference))
    .map((reference) => reference.split(/[?#]/, 1)[0]);
}

describe("GitHub Pages assets", () => {
  it("keeps every local index reference inside the published docs directory", () => {
    for (const reference of localAssetReferences(indexHtml)) {
      const target = resolve(docsDirectory, reference);
      const relativeTarget = relative(docsDirectory, target);

      expect(relativeTarget, `${reference} must stay inside docs/`).not.toMatch(/^\.\.(?:[\\/]|$)/);
      expect(existsSync(target), `${reference} must exist in docs/`).toBe(true);
    }
  });
});
