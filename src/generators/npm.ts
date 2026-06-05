/**
 * npm & PyPI Generators
 *
 * npm: Fetches your published npm packages, keywords, and project metadata.
 * PyPI: Fetches packages you've published, either by username or by explicit package names.
 *
 * @flag --npm <username>              npm packages by maintainer username
 * @flag --pypi <username>             PyPI packages by username (auto-discovers all your packages)
 * @flag --pypi <pkg1,pkg2,...>        PyPI packages by explicit comma-separated names
 * @example mcp-me generate ./profile --npm sindresorhus --pypi gvanrossum
 * @example mcp-me generate ./profile --pypi requests,flask,django
 * @auth None required (public registries)
 * @api https://github.com/npm/registry/blob/main/docs/REGISTRY-API.md
 * @api https://warehouse.pypa.io/api-reference/json.html
 * @api https://pypi.org/pypi (XMLRPC for user_packages lookup)
 * @data identity, skills (keywords), projects (packages), faq
 */
import type { GeneratorSource, PartialProfile } from "./types.js";

interface NpmPackage {
  name: string;
  version: string;
  description?: string;
  keywords?: string[];
  date: string;
  links: { npm?: string; homepage?: string; repository?: string };
  publisher?: { username: string; email?: string };
}

interface NpmSearchResult {
  objects: { package: NpmPackage }[];
  total: number;
}

interface PyPIPackage {
  info: {
    name: string;
    version: string;
    summary: string;
    home_page: string | null;
    project_url: string;
    keywords: string;
    author: string;
    author_email: string;
    classifiers: string[];
    project_urls: Record<string, string> | null;
  };
}

async function fetchNpmPackages(username: string): Promise<NpmPackage[]> {
  const response = await fetch(
    `https://registry.npmjs.org/-/v1/search?text=maintainer:${username}&size=100`,
    { headers: { Accept: "application/json", "User-Agent": "mcp-me-generator" } },
  );
  if (!response.ok) {
    throw new Error(`npm API error: ${response.status} ${response.statusText}`);
  }
  const data = (await response.json()) as NpmSearchResult;
  return data.objects.map((o) => o.package);
}

async function fetchPyPIPackage(packageName: string): Promise<PyPIPackage | null> {
  const response = await fetch(`https://pypi.org/pypi/${packageName}/json`, {
    headers: { Accept: "application/json", "User-Agent": "mcp-me-generator" },
  });
  if (!response.ok) return null;
  return response.json() as Promise<PyPIPackage>;
}

// Uses the PyPI XMLRPC legacy API to fetch all packages owned/maintained by a username.
// Returns package names, or empty array if the user has no packages or doesn't exist.
async function fetchPyPIUserPackages(username: string): Promise<string[]> {
  const xmlBody = `<?xml version='1.0'?><methodCall><methodName>user_packages</methodName><params><param><value><string>${username}</string></value></param></params></methodCall>`;
  try {
    const resp = await fetch("https://pypi.org/pypi", {
      method: "POST",
      headers: { "Content-Type": "text/xml", "User-Agent": "mcp-me-generator" },
      body: xmlBody,
    });
    if (!resp.ok) return [];
    const xml = await resp.text();
    // Response is an array of [role, package_name] pairs encoded as XML-RPC.
    // Extract all <string> values; odd indices (1, 3, 5, …) are package names.
    const strings = [...xml.matchAll(/<string>([^<]*)<\/string>/g)].map((m) => m[1]);
    return strings.filter((_, i) => i % 2 === 1).filter(Boolean);
  } catch {
    return [];
  }
}

export const npmGenerator: GeneratorSource = {
  name: "npm",
  flag: "npm",
  flagArg: "<username>",
  description: "npm published packages, keywords",
  category: "packages",

  async generate(config): Promise<PartialProfile> {
    const username = config.username as string;
    if (!username) throw new Error("npm username is required");

    console.log(`  [npm] Fetching packages for ${username}...`);
    const packages = await fetchNpmPackages(username);
    console.log(`  [npm] Found ${packages.length} published packages.`);

    // Extract keywords as skills
    const keywordCounts: Record<string, number> = {};
    for (const pkg of packages) {
      for (const kw of pkg.keywords ?? []) {
        keywordCounts[kw] = (keywordCounts[kw] ?? 0) + 1;
      }
    }

    const tools = Object.entries(keywordCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 15)
      .map(([kw]) => ({ name: kw, category: "npm-keyword" }));

    // Projects from packages
    const projects = packages
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 15)
      .map((pkg) => ({
        name: pkg.name,
        description: pkg.description ?? "npm package",
        url: pkg.links.homepage ?? pkg.links.npm ?? `https://www.npmjs.com/package/${pkg.name}`,
        repo_url: pkg.links.repository,
        status: "active" as const,
        technologies: pkg.keywords ?? [],
        start_date: pkg.date.slice(0, 10),
        category: "npm-package",
      }));

    const identity: PartialProfile["identity"] = {
      contact: {
        social: [
          { platform: "npm", url: `https://www.npmjs.com/~${username}`, username },
        ],
      },
    };

    const faq: PartialProfile["faq"] = packages.length > 0
      ? [
          {
            question: "Do you publish open-source packages?",
            answer: `Yes, I have ${packages.length} package(s) published on npm. Notable: ${packages.slice(0, 3).map((p) => p.name).join(", ")}.`,
            category: "open-source",
          },
        ]
      : [];

    return {
      identity,
      skills: { tools },
      projects,
      faq,
    };
  },
};

export const pypiGenerator: GeneratorSource = {
  name: "pypi",
  flag: "pypi",
  flagArg: "<username|pkg1,pkg2>",
  description: "PyPI packages by username or comma-separated names",
  category: "packages",

  async generate(config): Promise<PartialProfile> {
    const rawPackages = config.packages as string[];
    if (!rawPackages?.length) throw new Error("PyPI username or package names are required");

    let packageNames: string[];
    let resolvedByUsername = false;

    // Single value with no commas → try as a username first, fall back to package name.
    if (rawPackages.length === 1) {
      const candidate = rawPackages[0];
      console.log(`  [PyPI] Looking up packages for user "${candidate}"...`);
      const userPackages = await fetchPyPIUserPackages(candidate);
      if (userPackages.length > 0) {
        console.log(`  [PyPI] Found ${userPackages.length} package(s) owned by "${candidate}".`);
        packageNames = userPackages;
        resolvedByUsername = true;
      } else {
        console.log(`  [PyPI] No user found for "${candidate}", treating as package name.`);
        packageNames = rawPackages;
      }
    } else {
      packageNames = rawPackages;
    }

    console.log(`  [PyPI] Fetching metadata for ${packageNames.length} package(s)...`);
    const packages: PyPIPackage[] = [];

    for (const name of packageNames) {
      const pkg = await fetchPyPIPackage(name);
      if (pkg) {
        packages.push(pkg);
        console.log(`  [PyPI] ✔ ${name} v${pkg.info.version}`);
      } else {
        console.log(`  [PyPI] ✗ ${name} not found`);
      }
    }

    const projects = packages.map((pkg) => ({
      name: pkg.info.name,
      description: pkg.info.summary,
      url: pkg.info.project_urls?.["Homepage"] ?? pkg.info.home_page ?? `https://pypi.org/project/${pkg.info.name}`,
      status: "active" as const,
      technologies: pkg.info.keywords?.split(",").map((k) => k.trim()).filter(Boolean) ?? [],
      category: "pypi-package",
    }));

    const identity: PartialProfile["identity"] = resolvedByUsername
      ? {
          contact: {
            social: [{ platform: "pypi", url: `https://pypi.org/user/${rawPackages[0]}`, username: rawPackages[0] }],
          },
        }
      : undefined;

    const faq: PartialProfile["faq"] = packages.length > 0
      ? [
          {
            question: "Do you publish Python packages?",
            answer: `Yes, I have ${packages.length} package(s) on PyPI: ${packages.map((p) => p.info.name).join(", ")}.`,
            category: "open-source",
          },
        ]
      : [];

    return { identity, projects, faq };
  },
};
