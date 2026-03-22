import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { version } from "../package.json";
import { PROFILE_CATEGORIES } from "./schema/index.js";
import { loadProfile, loadPluginsConfig, searchProfile, type ProfileBundle } from "./loader.js";
import { discoverPlugins, type McpMePlugin, type PluginPrompt } from "./plugin-engine/index.js";

const RESOURCE_DESCRIPTIONS: Record<string, { title: string; description: string }> = {
  identity: { title: "Who I Am", description: "Name, bio, location, email, website, and social media links. Use this to learn who this person is and how to contact them." },
  career: { title: "My Career & Experience", description: "Work history, job titles, companies, education, and certifications. Use this to understand professional background and expertise." },
  skills: { title: "My Skills & Technologies", description: "Programming languages (with proficiency levels), technical skills, frameworks, and tools. Use this to evaluate technical capabilities." },
  interests: { title: "My Interests & Hobbies", description: "Hobbies, topics of interest, favorite subjects. Use this to understand what this person cares about beyond work." },
  personality: { title: "My Personality & Values", description: "Personality traits, values, work style preferences, MBTI type, strengths. Use this to understand communication and collaboration style." },
  goals: { title: "My Goals", description: "Short-term, medium-term, and long-term personal and professional goals. Use this to understand aspirations and direction." },
  projects: { title: "My Projects & Portfolio", description: "Open-source projects, published books, articles, packages, and creative work with links. Use this to see what this person has built." },
  faq: { title: "FAQ About Me", description: "Pre-answered questions about this person — reading habits, published works, online presence, timezone, languages spoken. Use this for quick facts." },
};

/**
 * Create and configure an MCP server with profile data and plugins.
 */
export async function createMcpMeServer(profileDir: string): Promise<McpServer> {
  const server = new McpServer({
    name: "mcp-me",
    version,
  });

  // Load profile data
  const profile = await loadProfile(profileDir);
  if (!profile.valid) {
    console.warn("Profile has validation errors:");
    profile.errors.forEach((e) => console.warn(`  ${e}`));
  }

  // Register core resources
  registerCoreResources(server, profile);

  // Register core tools
  registerCoreTools(server, profile);

  // Register core prompts
  registerCorePrompts(server, profile);

  // Load and register plugins
  const pluginsConfig = await loadPluginsConfig(profileDir);
  const plugins = await discoverPlugins(pluginsConfig);
  registerPlugins(server, plugins);

  return server;
}

function registerCoreResources(server: McpServer, profile: ProfileBundle): void {
  for (const category of PROFILE_CATEGORIES) {
    const data = profile.data[category];
    if (!data) continue;

    const meta = RESOURCE_DESCRIPTIONS[category];
    const uri = `me://${category}`;

    server.registerResource(
      `profile-${category}`,
      uri,
      {
        title: meta.title,
        description: meta.description,
        mimeType: "application/json",
      },
      async () => ({
        contents: [
          {
            uri,
            mimeType: "application/json",
            text: JSON.stringify(data, null, 2),
          },
        ],
      }),
    );
  }
}

function registerCoreTools(server: McpServer, profile: ProfileBundle): void {
  server.registerTool(
    "ask_about_me",
    {
      title: "Ask About Me \u2014 Personal Q&A",
      description:
        "Ask any question about this person and get an answer based on their complete profile. " +
        "Covers: bio, career history, skills, projects, interests, personality, goals, and FAQ. " +
        "Examples: 'What programming languages do they know?', 'Where do they work?', 'What books have they written?'",
      inputSchema: z.object({
        question: z.string().describe("Any question about this person (e.g. 'What are their top skills?', 'Do they have open-source projects?')"),
      }),
      annotations: { readOnlyHint: true },
    },
    async ({ question }) => {
      const sections: string[] = [];

      for (const [category, data] of Object.entries(profile.data)) {
        if (data) {
          sections.push(`## ${category}\n${JSON.stringify(data, null, 2)}`);
        }
      }

      const context = sections.join("\n\n");
      return {
        content: [
          {
            type: "text" as const,
            text:
              `Question: ${question}\n\n` +
              `Below is the person's complete profile data. Use it to answer the question.\n\n` +
              context,
          },
        ],
      };
    },
  );

  server.registerTool(
    "search_profile",
    {
      title: "Search Profile \u2014 Find Skills, Projects, Experience",
      description:
        "Search across the entire personal profile for a keyword or phrase. " +
        "Searches through: name, bio, job titles, companies, skill names, project names, article titles, book titles, social links, FAQ answers, and more. " +
        "Returns matching fields with their location in the profile.",
      inputSchema: z.object({
        query: z.string().describe("Keyword to search for (e.g. 'TypeScript', 'open-source', 'running')"),
      }),
      annotations: { readOnlyHint: true },
    },
    async ({ query }) => {
      const results = searchProfile(profile.data, query);
      const text =
        results.length > 0
          ? `Found ${results.length} match(es) for "${query}":\n\n${results.join("\n")}`
          : `No matches found for "${query}".`;

      return {
        content: [{ type: "text" as const, text }],
      };
    },
  );
}

function registerCorePrompts(server: McpServer, profile: ProfileBundle): void {
  const name =
    (profile.data.identity as Record<string, unknown>)?.name ?? "this person";

  server.registerPrompt(
    "introduce_me",
    {
      title: "Write My Introduction",
      description: `Generate a warm, professional 2-paragraph introduction for ${name} based on their career, skills, projects, and interests`,
    },
    () => ({
      messages: [
        {
          role: "user" as const,
          content: {
            type: "text" as const,
            text:
              `Based on the following profile data, write a warm and professional 2-paragraph introduction for ${name}.\n\n` +
              JSON.stringify(profile.data, null, 2),
          },
        },
      ],
    }),
  );

  server.registerPrompt(
    "summarize_career",
    {
      title: "Summarize My Career",
      description: `Write a concise career summary for ${name} covering work experience, key skills, and professional growth`,
    },
    () => ({
      messages: [
        {
          role: "user" as const,
          content: {
            type: "text" as const,
            text:
              `Based on the following career and skills data, write a concise career summary for ${name}.\n\n` +
              `Career: ${JSON.stringify(profile.data.career ?? {}, null, 2)}\n\n` +
              `Skills: ${JSON.stringify(profile.data.skills ?? {}, null, 2)}`,
          },
        },
      ],
    }),
  );

  server.registerPrompt(
    "technical_profile",
    {
      title: "Describe My Tech Stack",
      description: `Describe ${name}'s technical skills, programming languages, frameworks, tools, and notable technical projects`,
    },
    () => ({
      messages: [
        {
          role: "user" as const,
          content: {
            type: "text" as const,
            text:
              `Describe the technical profile of ${name} based on their skills and projects.\n\n` +
              `Skills: ${JSON.stringify(profile.data.skills ?? {}, null, 2)}\n\n` +
              `Projects: ${JSON.stringify(profile.data.projects ?? {}, null, 2)}`,
          },
        },
      ],
    }),
  );

  server.registerPrompt(
    "collaboration_fit",
    {
      title: "Am I a Good Fit?",
      description: `Evaluate whether ${name} would be a good fit for a specific project based on their skills, experience, interests, and availability`,
      argsSchema: {
        project_description: z.string().describe("Description of the project to evaluate fit for"),
      },
    },
    ({ project_description }) => ({
      messages: [
        {
          role: "user" as const,
          content: {
            type: "text" as const,
            text:
              `Based on the following profile, evaluate whether ${name} would be a good fit for this project:\n\n` +
              `Project: ${project_description}\n\n` +
              `Profile:\n${JSON.stringify(profile.data, null, 2)}`,
          },
        },
      ],
    }),
  );
}

function registerPlugins(server: McpServer, plugins: McpMePlugin[]): void {
  for (const plugin of plugins) {
    // Register plugin resources
    for (const resource of plugin.getResources()) {
      server.registerResource(
        resource.name,
        resource.uri,
        {
          title: resource.title,
          description: resource.description,
          mimeType: resource.mimeType ?? "application/json",
        },
        async () => ({
          contents: [
            {
              uri: resource.uri,
              mimeType: resource.mimeType ?? "application/json",
              text: await resource.read(),
            },
          ],
        }),
      );
    }

    // Register plugin tools
    for (const tool of plugin.getTools()) {
      server.registerTool(
        tool.name,
        {
          title: tool.title,
          description: tool.description,
          inputSchema: tool.inputSchema,
          annotations: tool.annotations,
        },
        async (input) => ({
          content: [
            {
              type: "text" as const,
              text: await tool.execute(input as Record<string, unknown>),
            },
          ],
        }),
      );
    }

    // Register plugin prompts
    const prompts = plugin.getPrompts?.() ?? [];
    for (const prompt of prompts) {
      registerPluginPrompt(server, prompt);
    }
  }
}

function registerPluginPrompt(server: McpServer, prompt: PluginPrompt): void {
  if (prompt.argsSchema) {
    // Plugin prompts with args: wrap argsSchema in a raw shape if it's a ZodObject
    const rawShape =
      "shape" in prompt.argsSchema
        ? (prompt.argsSchema as z.ZodObject<z.ZodRawShape>).shape
        : { input: prompt.argsSchema };

    server.registerPrompt(
      prompt.name,
      {
        title: prompt.title,
        description: prompt.description,
        argsSchema: rawShape as Record<string, z.ZodType>,
      },
      (args) => ({
        messages: prompt.generate(args as Record<string, unknown>).map((msg) => ({
          role: msg.role as "user" | "assistant",
          content: { type: "text" as const, text: msg.content },
        })),
      }),
    );
  } else {
    server.registerPrompt(
      prompt.name,
      {
        title: prompt.title,
        description: prompt.description,
      },
      () => ({
        messages: prompt.generate({}).map((msg) => ({
          role: msg.role as "user" | "assistant",
          content: { type: "text" as const, text: msg.content },
        })),
      }),
    );
  }
}
