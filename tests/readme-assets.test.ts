import { existsSync, readFileSync } from "node:fs";
import { dirname, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const readme = readFileSync(resolve(root, "README.md"), "utf8");
const mediaKit = readFileSync(resolve(root, "docs/media-kit.md"), "utf8");

const expectedArtwork = [
  { path: "docs/assets/readme-hero.svg", width: 1440, height: 560 },
  { path: "docs/assets/og-image.svg", width: 1200, height: 630 },
  { path: "docs/assets/product-flow.svg", width: 1440, height: 720 },
  { path: "docs/assets/promo-banner.svg", width: 1600, height: 900 },
] as const;

function localImageReferences(markdown: string): string[] {
  return Array.from(markdown.matchAll(/<img\s+[^>]*src=["']([^"']+)["']/gi), ([, source]) => source)
    .filter((source) => !/^(?:[a-z]+:|\/\/)/i.test(source))
    .map((source) => source.split(/[?#]/, 1)[0]);
}

describe("README artwork", () => {
  it("keeps every local image reference inside the repository", () => {
    for (const reference of localImageReferences(readme)) {
      const target = resolve(root, reference);
      const relativeTarget = relative(root, target);

      expect(relativeTarget, `${reference} must stay inside the repository`).not.toMatch(
        /^\.\.(?:[\\/]|$)/,
      );
      expect(existsSync(target), `${reference} must exist`).toBe(true);
    }
  });

  it("uses the dedicated README hero and product flow", () => {
    expect(readme).toContain('src="docs/assets/readme-hero.svg"');
    expect(readme).toContain('src="docs/assets/product-flow.svg"');
    expect(readme).not.toContain('src="docs/assets/og-image.svg"');
  });

  it.each(expectedArtwork)("documents $path in the media kit", (artwork) => {
    expect(mediaKit).toContain(artwork.path.replace("docs/", ""));
  });

  it.each(expectedArtwork)("keeps $path accessible and at its intended size", (artwork) => {
    const svg = readFileSync(resolve(root, artwork.path), "utf8");

    expect(svg).toContain(`width="${artwork.width}"`);
    expect(svg).toContain(`height="${artwork.height}"`);
    expect(svg).toContain(`viewBox="0 0 ${artwork.width} ${artwork.height}"`);
    expect(svg).toMatch(/<title\s+id="title">[^<]+<\/title>/);
    expect(svg).toMatch(/<desc\s+id="desc">[^<]+<\/desc>/);
    expect(svg).toContain('aria-labelledby="title desc"');
  });
});
