import { existsSync } from "node:fs";
import { dirname, join } from "node:path";

/**
 * Walking upward from `startDir` until a `package.json` is found, returning
 * that directory as the package root. This is used to resolve non-compiled
 * runtime assets (the Typst library) correctly,
 * regardless of how deeply a bundler such as tsup flattens the compiled
 * output relative to the source tree
 */
export function findPackageRoot(startDir: string): string {
  let current = startDir;
  for (;;) {
    if (existsSync(join(current, "package.json"))) {
      return current;
    }
    const parent = dirname(current);
    if (parent === current) {
      throw new Error(`Could not locate package.json above ${startDir}`);
    }
    current = parent;
  }
}
