import { readFile, readdir } from "node:fs/promises";
import { join, basename } from "node:path";
import { parse as parseYaml } from "yaml";
import { ZodError, type ZodType } from "zod";
import { PROFILE_CATEGORIES, profileSchemaMap, type ProfileCategory } from "./schema/index.js";

export interface ProfileData {
  [key: string]: unknown;
}

export interface LoadResult {
  category: ProfileCategory;
  data: unknown;
  valid: boolean;
  errors?: string[];
}

export interface ProfileBundle {
  results: LoadResult[];
  data: Record<string, unknown>;
  valid: boolean;
  errors: string[];
}

/**
 * Load and validate a single YAML profile file.
 */
export async function loadProfileFile(
  filePath: string,
  category: ProfileCategory,
): Promise<LoadResult> {
  const schema = profileSchemaMap[category];
  if (!schema) {
    return {
      category,
      data: null,
      valid: false,
      errors: [`Unknown profile category: ${category}`],
    };
  }

  try {
    const content = await readFile(filePath, "utf-8");
    const parsed = parseYaml(content);
    const validated = schema.parse(parsed);
    return { category, data: validated, valid: true };
  } catch (error) {
    if (error instanceof ZodError) {
      const messages = error.issues.map(
        (issue) => `  ${issue.path.join(".")}: ${issue.message}`,
      );
      return {
        category,
        data: null,
        valid: false,
        errors: [`Validation errors in ${category}.yaml:`, ...messages],
      };
    }
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return { category, data: null, valid: true };
    }
    return {
      category,
      data: null,
      valid: false,
      errors: [`Failed to load ${category}.yaml: ${(error as Error).message}`],
    };
  }
}

/**
 * Load all profile YAML files from a directory.
 */
export async function loadProfile(profileDir: string): Promise<ProfileBundle> {
  const results: LoadResult[] = [];
  const data: Record<string, unknown> = {};
  const allErrors: string[] = [];

  for (const category of PROFILE_CATEGORIES) {
    const filePath = join(profileDir, `${category}.yaml`);
    const result = await loadProfileFile(filePath, category);
    results.push(result);

    if (result.valid && result.data !== null) {
      data[category] = result.data;
    }
    if (result.errors) {
      allErrors.push(...result.errors);
    }
  }

  return {
    results,
    data,
    valid: allErrors.length === 0,
    errors: allErrors,
  };
}

/**
 * Load plugins.yaml configuration from the profile directory.
 */
export async function loadPluginsConfig(
  profileDir: string,
): Promise<Record<string, Record<string, unknown>>> {
  const filePath = join(profileDir, "plugins.yaml");
  try {
    const content = await readFile(filePath, "utf-8");
    const parsed = parseYaml(content);
    return (parsed?.plugins as Record<string, Record<string, unknown>>) ?? {};
  } catch {
    return {};
  }
}

/**
 * Validate a single YAML string against a schema.
 */
export function validateYaml(content: string, schema: ZodType): { valid: boolean; errors?: string[] } {
  try {
    const parsed = parseYaml(content);
    schema.parse(parsed);
    return { valid: true };
  } catch (error) {
    if (error instanceof ZodError) {
      const messages = error.issues.map(
        (issue) => `${issue.path.join(".")}: ${issue.message}`,
      );
      return { valid: false, errors: messages };
    }
    return { valid: false, errors: [(error as Error).message] };
  }
}

/**
 * Search across all loaded profile data for a keyword.
 */
export function searchProfile(data: Record<string, unknown>, query: string): string[] {
  const results: string[] = [];
  const lowerQuery = query.toLowerCase();

  function searchObj(obj: unknown, path: string): void {
    if (typeof obj === "string") {
      if (obj.toLowerCase().includes(lowerQuery)) {
        results.push(`${path}: ${obj}`);
      }
    } else if (Array.isArray(obj)) {
      obj.forEach((item, i) => searchObj(item, `${path}[${i}]`));
    } else if (obj !== null && typeof obj === "object") {
      for (const [key, value] of Object.entries(obj as Record<string, unknown>)) {
        searchObj(value, path ? `${path}.${key}` : key);
      }
    }
  }

  searchObj(data, "");
  return results;
}
