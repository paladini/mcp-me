import type { GeneratorSource, PartialProfile } from "./types.js";

interface YTChannel {
  items: {
    id: string;
    snippet: { title: string; description: string; customUrl?: string; publishedAt: string };
    statistics: { viewCount: string; subscriberCount: string; videoCount: string };
  }[];
}

export const youtubeGenerator: GeneratorSource = {
  name: "youtube",
  flag: "youtube",
  flagArg: "<channel-id>",
  description: "YouTube channel stats, videos (needs YOUTUBE_API_KEY)",
  category: "writing",

  async generate(config): Promise<PartialProfile> {
    const channelId = config.username as string;
    if (!channelId) throw new Error("YouTube channel ID is required");

    const apiKey = process.env.YOUTUBE_API_KEY;
    if (!apiKey) throw new Error("YOUTUBE_API_KEY environment variable is required. Get a free key at https://console.developers.google.com");

    console.log(`  [YouTube] Fetching channel ${channelId}...`);
    const resp = await fetch(
      `https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics&id=${channelId}&key=${apiKey}`,
      { headers: { "User-Agent": "mcp-me-generator" } },
    );
    if (!resp.ok) throw new Error(`YouTube API error: ${resp.status}`);
    const data = (await resp.json()) as YTChannel;
    const channel = data.items?.[0];
    if (!channel) throw new Error(`YouTube channel "${channelId}" not found`);

    const stats = channel.statistics;
    console.log(`  [YouTube] ${channel.snippet.title}: ${parseInt(stats.subscriberCount).toLocaleString()} subscribers, ${stats.videoCount} videos.`);

    const identity: PartialProfile["identity"] = {
      ...(channel.snippet.title ? { name: channel.snippet.title } : {}),
      ...(channel.snippet.description ? { bio: channel.snippet.description.slice(0, 500) } : {}),
      contact: {
        social: [{
          platform: "youtube",
          url: channel.snippet.customUrl
            ? `https://youtube.com/${channel.snippet.customUrl}`
            : `https://youtube.com/channel/${channel.id}`,
          username: channel.snippet.customUrl ?? channel.id,
        }],
      },
    };

    const faq: PartialProfile["faq"] = [{
      question: "Do you make YouTube videos?",
      answer: `Yes, my channel "${channel.snippet.title}" has ${parseInt(stats.subscriberCount).toLocaleString()} subscribers, ${parseInt(stats.viewCount).toLocaleString()} views, and ${stats.videoCount} videos.`,
      category: "content",
    }];

    return { identity, faq };
  },
};
