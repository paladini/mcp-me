/**
 * Docker Hub Generator
 *
 * Fetches your published container images, stars, and pull counts.
 *
 * @flag --dockerhub <username>
 * @example mcp-me generate ./profile --dockerhub myuser
 * @auth None required (public API)
 * @api https://docs.docker.com/docker-hub/api/latest/
 * @data identity, skills (docker), projects (images), faq (pull stats)
 */
import type { GeneratorSource, PartialProfile } from "./types.js";

interface DockerHubRepo {
  name: string;
  namespace: string;
  description: string;
  star_count: number;
  pull_count: number;
  last_updated: string;
  is_automated: boolean;
}

export const dockerhubGenerator: GeneratorSource = {
  name: "dockerhub",
  flag: "dockerhub",
  flagArg: "<username>",
  description: "Docker Hub published container images",
  category: "packages",

  async generate(config): Promise<PartialProfile> {
    const username = config.username as string;
    if (!username) throw new Error("Docker Hub username is required");

    console.log(`  [DockerHub] Fetching repos for ${username}...`);
    const resp = await fetch(
      `https://hub.docker.com/v2/namespaces/${username}/repositories/?page_size=100`,
      { headers: { Accept: "application/json", "User-Agent": "mcp-me-generator" } },
    );
    if (!resp.ok) {
      if (resp.status === 404) throw new Error(`Docker Hub user "${username}" not found`);
      throw new Error(`Docker Hub API error: ${resp.status} ${resp.statusText}`);
    }
    const data = (await resp.json()) as { results: DockerHubRepo[] };
    const repos = data.results ?? [];
    console.log(`  [DockerHub] Found ${repos.length} repositories.`);

    const projects = repos.slice(0, 20).map((r) => ({
      name: `${r.namespace}/${r.name}`,
      description: r.description || "Docker container image",
      url: `https://hub.docker.com/r/${r.namespace}/${r.name}`,
      status: "active" as const,
      technologies: ["docker"],
      category: "container",
      ...(r.star_count > 0 ? { stars: r.star_count } : {}),
    }));

    const totalPulls = repos.reduce((sum, r) => sum + r.pull_count, 0);

    const identity: PartialProfile["identity"] = {
      contact: {
        social: [{ platform: "dockerhub", url: `https://hub.docker.com/u/${username}`, username }],
      },
    };

    const tools = [{ name: "Docker", category: "devops" }];

    const faq: PartialProfile["faq"] = repos.length > 0
      ? [{
          question: "Do you publish Docker images?",
          answer: `Yes, ${repos.length} image(s) on Docker Hub with ${totalPulls.toLocaleString()} total pulls.`,
          category: "devops",
        }]
      : [];

    return { identity, skills: { tools }, projects, faq };
  },
};
