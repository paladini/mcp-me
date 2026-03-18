/**
 * Hugging Face Generator
 *
 * Fetches your published AI/ML models and datasets on Hugging Face.
 *
 * @flag --huggingface <username>
 * @example mcp-me generate ./profile --huggingface meta-llama
 * @auth None required (public API)
 * @api https://huggingface.co/docs/hub/api
 * @data identity, skills (ML frameworks), projects (models/datasets), faq
 */
import type { GeneratorSource, PartialProfile } from "./types.js";

interface HFModel {
  id: string;
  modelId: string;
  author: string;
  downloads: number;
  likes: number;
  tags: string[];
  pipeline_tag?: string;
  createdAt: string;
}

interface HFDataset {
  id: string;
  author: string;
  downloads: number;
  likes: number;
  tags: string[];
  createdAt: string;
}

export const huggingfaceGenerator: GeneratorSource = {
  name: "huggingface",
  flag: "huggingface",
  flagArg: "<username>",
  description: "Hugging Face models, datasets, ML skills",
  category: "code",

  async generate(config): Promise<PartialProfile> {
    const username = config.username as string;
    if (!username) throw new Error("Hugging Face username is required");

    console.log(`  [HuggingFace] Fetching models for ${username}...`);
    const modelsResp = await fetch(
      `https://huggingface.co/api/models?author=${username}&sort=downloads&direction=-1&limit=50`,
      { headers: { Accept: "application/json", "User-Agent": "mcp-me-generator" } },
    );
    if (!modelsResp.ok) throw new Error(`Hugging Face API error: ${modelsResp.status}`);
    const models = (await modelsResp.json()) as HFModel[];

    console.log(`  [HuggingFace] Fetching datasets...`);
    const datasetsResp = await fetch(
      `https://huggingface.co/api/datasets?author=${username}&sort=downloads&direction=-1&limit=50`,
      { headers: { Accept: "application/json", "User-Agent": "mcp-me-generator" } },
    );
    const datasets = datasetsResp.ok ? ((await datasetsResp.json()) as HFDataset[]) : [];

    console.log(`  [HuggingFace] Found ${models.length} models, ${datasets.length} datasets.`);

    const tagCounts: Record<string, number> = {};
    for (const m of models) {
      for (const t of m.tags) tagCounts[t] = (tagCounts[t] ?? 0) + 1;
    }

    const tools = Object.entries(tagCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 15)
      .map(([tag]) => ({ name: tag, category: "ml" }));

    const projects = [
      ...models.slice(0, 15).map((m) => ({
        name: m.modelId,
        description: m.pipeline_tag ? `${m.pipeline_tag} model` : "ML model",
        url: `https://huggingface.co/${m.modelId}`,
        status: "active" as const,
        technologies: m.tags.slice(0, 5),
        start_date: m.createdAt?.slice(0, 10),
        category: "ml-model",
        ...(m.likes > 0 ? { stars: m.likes } : {}),
      })),
      ...datasets.slice(0, 5).map((d) => ({
        name: d.id,
        description: "Dataset",
        url: `https://huggingface.co/datasets/${d.id}`,
        status: "active" as const,
        technologies: d.tags.slice(0, 5),
        start_date: d.createdAt?.slice(0, 10),
        category: "dataset",
        ...(d.likes > 0 ? { stars: d.likes } : {}),
      })),
    ];

    const totalDownloads = models.reduce((s, m) => s + m.downloads, 0);

    const identity: PartialProfile["identity"] = {
      contact: {
        social: [{ platform: "huggingface", url: `https://huggingface.co/${username}`, username }],
      },
    };

    const faq: PartialProfile["faq"] = [{
      question: "Do you work with AI/ML models?",
      answer: `Yes, I have ${models.length} model(s) and ${datasets.length} dataset(s) on Hugging Face with ${totalDownloads.toLocaleString()} total downloads.`,
      category: "ml",
    }];

    return { identity, skills: { tools }, projects, faq };
  },
};
