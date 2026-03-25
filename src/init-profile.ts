import { access, cp, mkdir, readdir } from "node:fs/promises";
import { join } from "node:path";

export interface InitProfileOptions {
  targetDir: string;
  templatesDir: string;
  force?: boolean;
  logger?: Pick<typeof console, "log">;
}

export interface InitProfileResult {
  copied: number;
  skipped: number;
}

export async function initProfileDirectory(options: InitProfileOptions): Promise<InitProfileResult> {
  const { targetDir, templatesDir, force = false, logger = console } = options;

  await mkdir(targetDir, { recursive: true });

  const templates = await readdir(templatesDir, { withFileTypes: true });
  let copied = 0;
  let skipped = 0;

  for (const entry of templates) {
    const sourcePath = join(templatesDir, entry.name);
    const targetPath = join(targetDir, entry.name);

    if (!force) {
      try {
        await access(targetPath);
        logger.log(`  Skipped: ${entry.name} (already exists, use --force to overwrite)`);
        skipped++;
        continue;
      } catch {
        // Target path doesn't exist, proceed.
      }
    }

    if (entry.isDirectory()) {
      await cp(sourcePath, targetPath, { recursive: true });
    } else {
      await cp(sourcePath, targetPath);
    }

    logger.log(`  Created: ${entry.name}`);
    copied++;
  }

  return { copied, skipped };
}