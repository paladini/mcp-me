/**
 * npm & PyPI Generators
 *
 * npm: Fetches your published npm packages, keywords, and project metadata.
 * PyPI: Fetches metadata for specified Python packages you've published.
 *
 * @flag --npm <username>        npm packages by maintainer
 * @flag --pypi <username>       PyPI packages by user
 * @example mcp-me generate ./profile --npm sindresorhus --pypi tiangolo
 * @auth None required (public registries)
 * @api https://github.com/npm/registry/blob/main/docs/REGISTRY-API.md
 * @api https://warehouse.pypa.io/api-reference/json.html
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

async function fetchPyPIUserPackages(username: string): Promise<string[]> {
  const resp = await fetch(`https://pypi.org/user/${username}/`, {
    headers: { "User-Agent": "mcp-me-generator" },
  });
  if (!resp.ok) {
    if (resp.status === 404) throw new Error(`PyPI user "${username}" not found`);
    throw new Error(`PyPI HTTP error: ${resp.status}`);
  }
  const html = await resp.text();
  const regex = /<h3 class="package-snippet__title">([^<]+)<\/h3>/g;
  const packages: string[] = [];
  let match;
  while ((match = regex.exec(html)) !== null) {
    if (match[1]) {
      packages.push(match[1].trim());
    }
  }
  return packages;
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
  flagArg: "<username>",
  description: "PyPI published packages",
  category: "packages",

  async generate(config): Promise<PartialProfile> {
    const username = config.username as string;
    if (!username) throw new Error("PyPI username is required");

    console.log(`  [PyPI] Fetching packages for ${username}...`);
    const allPackageNames = await fetchPyPIUserPackages(username);
    const packageNames = allPackageNames.slice(0, 15); // limit to 15
    console.log(`  [PyPI] Found ${allPackageNames.length} published packages. Fetching metadata for up to 15...`);

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
      description: pkg.info.summary || "PyPI package",
      url: pkg.info.project_urls?.["Homepage"] ?? pkg.info.home_page ?? `https://pypi.org/project/${pkg.info.name}`,
      status: "active" as const,
      technologies: pkg.info.keywords?.split(",").map((k) => k.trim()).filter(Boolean) ?? ["python"],
      category: "pypi-package",
    }));

    const identity: PartialProfile["identity"] = {
      contact: {
        social: [
          { platform: "pypi", url: `https://pypi.org/user/${username}`, username },
        ],
      },
    };

    const faq: PartialProfile["faq"] = packages.length > 0
      ? [
          {
            question: "Do you publish Python packages?",
            answer: `Yes, I have ${allPackageNames.length} package(s) on PyPI. Notable: ${packages.slice(0, 3).map((p) => p.info.name).join(", ")}.`,
            category: "open-source",
          },
        ]
      : [];

    return {
      identity,
      projects,
      faq,
    };
  },
};
