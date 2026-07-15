import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { ProfileBundle } from "../loader.js";
import type { WritingBundle } from "./types.js";
import {
  extractSamples,
  getWritingReferences,
  searchCorpus,
} from "./corpus-loader.js";
import { analyzeWritingStyle } from "./analyzer.js";

export function registerWritingMcp(
  server: McpServer,
  profile: ProfileBundle,
  writing: WritingBundle,
): void {
  if (writing.style) {
    server.registerResource(
      "writing-style",
      "me://writing/style",
      {
        title: "My Writing Style",
        description:
          "Writing format profiles, tone, formality, and global voice guide. " +
          "Use to understand how this person writes in different contexts.",
        mimeType: "application/json",
      },
      async () => ({
        contents: [
          {
            uri: "me://writing/style",
            mimeType: "application/json",
            text: JSON.stringify(writing.style, null, 2),
          },
        ],
      }),
    );
  }

  if (writing.manifest) {
    server.registerResource(
      "writing-corpus",
      "me://writing/corpus",
      {
        title: "My Writing Corpus",
        description:
          "Manifest of published texts (metadata only). Use search_writing_corpus or get_writing_references for content.",
        mimeType: "application/json",
      },
      async () => ({
        contents: [
          {
            uri: "me://writing/corpus",
            mimeType: "application/json",
            text: JSON.stringify(writing.manifest, null, 2),
          },
        ],
      }),
    );
  }

  if (writing.documents.length > 0) {
    server.registerResource(
      "writing-samples",
      "me://writing/samples",
      {
        title: "My Writing Samples",
        description:
          "Representative excerpts from the writing corpus. " +
          "Filter by format profile when emulating voice for a specific context.",
        mimeType: "application/json",
      },
      async (uri) => {
        const url = new URL(uri.href);
        const profileFilter = url.searchParams.get("profile") ?? undefined;
        const samples = extractSamples(writing.documents, profileFilter, 5);
        return {
          contents: [
            {
              uri: uri.href,
              mimeType: "application/json",
              text: JSON.stringify({ profile: profileFilter ?? null, samples }, null, 2),
            },
          ],
        };
      },
    );
  }

  server.registerTool(
    "analyze_writing_style",
    {
      title: "Analyze Writing Style",
      description:
        "Analyze writing patterns from the corpus: sentence length, vocabulary, punctuation, first-person usage. " +
        "Optionally filter by format profile (personal_blog, tech_news, ironic_thread).",
      inputSchema: z.object({
        profile: z.string().optional().describe("Format profile name to analyze"),
      }),
      annotations: { readOnlyHint: true },
    },
    async ({ profile }) => {
      const result = analyzeWritingStyle(writing.documents, writing.style, profile);
      return {
        content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }],
      };
    },
  );

  server.registerTool(
    "search_writing_corpus",
    {
      title: "Search Writing Corpus",
      description: "Search local writing corpus (.md files) by keyword or tag.",
      inputSchema: z.object({
        query: z.string().describe("Keyword or phrase to search for"),
        profile: z.string().optional().describe("Filter by format profile"),
      }),
      annotations: { readOnlyHint: true },
    },
    async ({ query, profile }) => {
      let results = searchCorpus(writing.documents, query);
      if (profile) {
        results = results.filter((d) => d.formatProfile === profile);
      }
      const text =
        results.length > 0
          ? results
              .map((d) => `- **${d.title}** (${d.formatProfile ?? "unknown"}): ${d.body.slice(0, 200)}…`)
              .join("\n")
          : `No corpus matches for "${query}".`;
      return { content: [{ type: "text" as const, text }] };
    },
  );

  server.registerTool(
    "get_writing_references",
    {
      title: "Get Writing References",
      description:
        "Find relevant corpus excerpts for a topic and format profile to use as references when emulating voice.",
      inputSchema: z.object({
        topic: z.string().describe("Topic to find references for"),
        profile: z.string().optional().describe("Format profile (personal_blog, tech_news, etc.)"),
        limit: z.number().optional().describe("Max references to return (default 3)"),
      }),
      annotations: { readOnlyHint: true },
    },
    async ({ topic, profile, limit }) => {
      const refs = getWritingReferences(writing.documents, topic, profile, limit ?? 3);
      const text =
        refs.length > 0
          ? refs
              .map(
                (d) =>
                  `## ${d.title}\nSource: ${d.source ?? "local"} | Profile: ${d.formatProfile ?? "default"}\n\n${d.body.slice(0, 600)}${d.body.length > 600 ? "…" : ""}`,
              )
              .join("\n\n---\n\n")
          : `No references found for topic "${topic}".`;
      return { content: [{ type: "text" as const, text }] };
    },
  );

  const name = (profile.data.identity as Record<string, unknown>)?.name ?? "this person";

  server.registerPrompt(
    "describe_my_writing",
    {
      title: "Describe My Writing Style",
      description: `Describe how ${name} writes — tone, structure, vocabulary — based on corpus and style profiles`,
      argsSchema: {
        profile: z.string().optional().describe("Format profile to describe (or all profiles)"),
      },
    },
    ({ profile: profileArg }) => {
      const analysis = analyzeWritingStyle(writing.documents, writing.style, profileArg);
      return {
        messages: [
          {
            role: "user" as const,
            content: {
              type: "text" as const,
              text:
                `Describe the writing style of ${name} based on the following data.\n\n` +
                `Style guide:\n${JSON.stringify(writing.style, null, 2)}\n\n` +
                `Analysis:\n${JSON.stringify(analysis, null, 2)}\n\n` +
                `Samples:\n${extractSamples(writing.documents, profileArg, 3).join("\n\n")}`,
            },
          },
        ],
      };
    },
  );

  server.registerPrompt(
    "emulate_my_voice",
    {
      title: "Write In My Voice",
      description: `Generate text in ${name}'s authentic voice for a topic, using corpus references and profile context`,
      argsSchema: {
        topic: z.string().describe("Topic to write about"),
        profile: z.string().optional().describe("Format profile (personal_blog, tech_news, ironic_thread)"),
        length: z.string().optional().describe("Desired length, e.g. '800 words' or 'short thread'"),
      },
    },
    ({ topic, profile: profileArg, length }) => {
      const profileName = profileArg ?? writing.style?.default_profile ?? "personal_blog";
      const refs = getWritingReferences(writing.documents, topic, profileName, 3);
      const profileStyle = writing.style?.profiles?.[profileName];
      return {
        messages: [
          {
            role: "user" as const,
            content: {
              type: "text" as const,
              text:
                `Write about "${topic}" in the authentic voice of ${name}.\n\n` +
                `Format profile: ${profileName}\n` +
                `Style guide: ${JSON.stringify(profileStyle, null, 2)}\n` +
                `Desired length: ${length ?? "match typical length for this profile"}\n\n` +
                `Use these corpus references for tone and structure:\n${refs.map((r) => r.body.slice(0, 400)).join("\n\n---\n\n")}\n\n` +
                `Also use factual context from their profile:\n${JSON.stringify(profile.data, null, 2)}\n\n` +
                `Write authentically — match their tone, vocabulary, and perspective. Do not mention that you are emulating.`,
            },
          },
        ],
      };
    },
  );

  server.registerPrompt(
    "rewrite_in_my_voice",
    {
      title: "Rewrite In My Voice",
      description: `Rewrite text to match ${name}'s writing style while preserving meaning`,
      argsSchema: {
        text: z.string().describe("Text to rewrite"),
        profile: z.string().optional().describe("Format profile to match"),
      },
    },
    ({ text, profile: profileArg }) => {
      const profileName = profileArg ?? writing.style?.default_profile ?? "personal_blog";
      const profileStyle = writing.style?.profiles?.[profileName];
      const samples = extractSamples(writing.documents, profileName, 2);
      return {
        messages: [
          {
            role: "user" as const,
            content: {
              type: "text" as const,
              text:
                `Rewrite the following text in ${name}'s voice. Preserve the meaning but match their style.\n\n` +
                `Format profile: ${profileName}\n` +
                `Style guide: ${JSON.stringify(profileStyle, null, 2)}\n\n` +
                `Writing samples:\n${samples.join("\n\n")}\n\n` +
                `Text to rewrite:\n${text}`,
            },
          },
        ],
      };
    },
  );
}
