import { defineConfig } from "tsup";

export default defineConfig([
  {
    entry: ["src/index.ts"],
    format: ["esm"],
    dts: true,
    sourcemap: true,
    clean: true,
    target: "node20",
    outDir: "dist",
  },
  {
    entry: ["src/cli.ts"],
    format: ["esm"],
    sourcemap: true,
    target: "node20",
    outDir: "dist",
    banner: {
      js: "#!/usr/bin/env node",
    },
  },
]);
