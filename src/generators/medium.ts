/**
 * Medium Generator
 *
 * Fetches your published articles, excerpts, and categories from Medium.
 * Tries three strategies in order of data richness:
 *   1. Unofficial JSON endpoint (?format=json) — full profile + all posts
 *   2. HTML scraping (__NEXT_DATA__ / Apollo embedded JSON + link extraction) — all posts
 *   3. RSS feed fallback — last 10 posts only
 *
 * @flag --medium <username>
 * @example mcp-me generate ./profile --medium @yourname
 * @auth None required (public endpoints)
 * @api https://medium.com/@username?format=json
 * @data identity, skills (article categories), projects (articles), interests, faq
 */
import type { GeneratorSource, PartialProfile } from "./types.js";
import { parseRssFeed, rssHtmlToText, summarizeText } from "../utils/rss.js";

interface MediumArticle {
  title: string;
  url: string;
  pubDate?: string;
  tags: string[];
  wordCount?: number;
  subtitle?: string;
  content?: string;
}

function normalizeMediumUsername(username: string): string {
  return username.trim().replace(/^@+/, "");
}

function countWords(text: string): number {
  if (!text) return 0;
  return text.split(/\s+/).filter(Boolean).length;
}

// Full browser-like headers to avoid 403 on Medium's bot-detection middleware
const FETCH_HEADERS = {
  "User-Agent": "Mozilla/5.0 (X11; Linux x86_64; rv:125.0) Gecko/20100101 Firefox/125.0",
  "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
  "Accept-Language": "en-US,en;q=0.9",
  "Accept-Encoding": "gzip, deflate, br",
  "Connection": "keep-alive",
  "Upgrade-Insecure-Requests": "1",
  "Sec-Fetch-Dest": "document",
  "Sec-Fetch-Mode": "navigate",
  "Sec-Fetch-Site": "none",
  "Sec-Fetch-User": "?1",
  "Cache-Control": "max-age=0",
  "DNT": "1",
};

const JSON_HEADERS = {
  ...FETCH_HEADERS,
  "Accept": "application/json, text/javascript, */*; q=0.01",
  "X-Requested-With": "XMLHttpRequest",
  "Sec-Fetch-Dest": "empty",
  "Sec-Fetch-Mode": "cors",
  "Sec-Fetch-Site": "same-origin",
  "Referer": "https://medium.com/",
};

// ─── Strategy 1: Unofficial JSON endpoint ────────────────────────────────────

function parseJsonPage(
  raw: string,
  username: string,
): {
  articles: MediumArticle[];
  nextRequest:
    | {
        path: string;
        params: Record<string, string>;
      }
    | undefined;
} {
  const jsonStart = raw.indexOf("{");
  if (jsonStart === -1) throw new Error("No JSON object found in response");
  const data = JSON.parse(raw.slice(jsonStart)) as Record<string, unknown>;
  const payload = (data?.payload ?? {}) as Record<string, unknown>;

  // Pagination for profile stream lives under payload.paging
  const paging = (payload.paging ?? {}) as Record<string, unknown>;
  const next = (paging.next ?? {}) as Record<string, unknown>;
  const path = typeof paging.path === "string" ? paging.path : undefined;

  let nextRequest:
    | {
        path: string;
        params: Record<string, string>;
      }
    | undefined;
  if (path && Object.keys(next).length > 0) {
    const params: Record<string, string> = {};
    for (const [key, value] of Object.entries(next)) {
      if (value === undefined || value === null) continue;
      // ignoredIds can be an array; Medium accepts repeated comma-separated values
      if (Array.isArray(value)) {
        if (value.length > 0) params[key] = value.join(",");
        continue;
      }
      params[key] = String(value);
    }

    nextRequest = {
      path,
      params,
    };
  }

  const postMap = ((payload.references ?? {}) as Record<string, unknown>)
    ?.Post as Record<string, Record<string, unknown>> | undefined;

  const articles: MediumArticle[] = [];
  if (postMap && typeof postMap === "object") {
    for (const p of Object.values(postMap)) {
      if (!p.title || typeof p.title !== "string") continue;
      const uniqueSlug = p.uniqueSlug as string | undefined;
      if (!uniqueSlug) continue;
      const virtuals = (p.virtuals ?? {}) as Record<string, unknown>;
      const tags = ((virtuals.tags as Array<{ name: string }>) ?? [])
        .map((t) => t.name)
        .filter(Boolean);

      articles.push({
        title: p.title,
        url: `https://medium.com/@${username}/${uniqueSlug}`,
        pubDate: p.firstPublishedAt
          ? new Date(p.firstPublishedAt as number).toISOString().slice(0, 10)
          : undefined,
        tags,
        wordCount: virtuals.wordCount as number | undefined,
        subtitle: virtuals.subtitle as string | undefined,
      });
    }
  }

  return { articles, nextRequest };
}

async function fetchViaJson(username: string): Promise<MediumArticle[]> {
  // First page: the profile page itself
  const firstRes = await fetch(`https://medium.com/@${username}?format=json`, {
    headers: JSON_HEADERS,
  });
  if (!firstRes.ok) throw new Error(`JSON endpoint returned ${firstRes.status}`);

  const firstRaw = await firstRes.text();
  // Medium prepends an XSSI guard like `])}while(1);</x>` before the JSON
  const { articles: firstPage, nextRequest: firstNextRequest } = parseJsonPage(firstRaw, username);
  if (firstPage.length === 0) throw new Error("No posts found in JSON payload");

  const allArticles = [...firstPage];
  const seen = new Set(allArticles.map((a) => a.url));

  // Subsequent pages via payload.paging.path + payload.paging.next params
  let nextRequest = firstNextRequest;
  const MAX_PAGES = 20; // safety cap
  let page = 1;

  while (nextRequest && page < MAX_PAGES) {
    const pageQuery = new URLSearchParams({
      format: "json",
      ...nextRequest.params,
    });
    const pageRes = await fetch(`${nextRequest.path}?${pageQuery.toString()}`, {
      headers: JSON_HEADERS,
    });
    if (!pageRes.ok) break;
    const pageRaw = await pageRes.text();

    let parsed: {
      articles: MediumArticle[];
      nextRequest:
        | {
            path: string;
            params: Record<string, string>;
          }
        | undefined;
    };
    try {
      parsed = parseJsonPage(pageRaw, username);
    } catch {
      break;
    }

    let added = 0;
    for (const a of parsed.articles) {
      if (!seen.has(a.url)) {
        seen.add(a.url);
        allArticles.push(a);
        added++;
      }
    }

    // Stop if no new articles or no further pagination
    if (added === 0 || !parsed.nextRequest) break;
    nextRequest = parsed.nextRequest;
    page++;
  }

  allArticles.sort((a, b) => {
    if (!a.pubDate && !b.pubDate) return 0;
    if (!a.pubDate) return 1;
    if (!b.pubDate) return -1;
    return b.pubDate.localeCompare(a.pubDate);
  });

  return allArticles;
}

// ─── Strategy 2: Sitemap XML ────────────────────────────────────────────────
// Medium generates per-user sitemaps served to SEO crawlers — rarely blocked.

async function fetchViaSitemap(username: string): Promise<MediumArticle[]> {
  // Medium's sitemap index for a user
  const sitemapUrl = `https://medium.com/sitemap/@${username}`;
  const res = await fetch(sitemapUrl, {
    headers: { ...FETCH_HEADERS, "Accept": "application/xml, text/xml, */*" },
  });
  if (!res.ok) throw new Error(`Sitemap returned ${res.status}`);
  const xml = await res.text();

  // Extract all <loc> entries that look like article URLs
  const locRegex = new RegExp(
    `https://medium[.]com/@${username}/[a-z0-9-]+-[a-f0-9]{6,}`,
    "gi",
  );
  const seen = new Set<string>();
  const articles: MediumArticle[] = [];

  let m: RegExpExecArray | null;
  while ((m = locRegex.exec(xml)) !== null) {
    const url = m[0].toLowerCase();
    if (seen.has(url)) continue;
    seen.add(url);
    // Slug → readable title (best effort without fetching each article)
    const slug = url.split(`/@${username}/`)[1] ?? "";
    const title = slug
      .replace(/-[a-f0-9]{6,}$/, "")
      .replace(/-/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase());
    articles.push({ title, url, tags: [] });
  }

  if (articles.length === 0) throw new Error("No article URLs found in sitemap");
  return articles;
}

// ─── Strategy 3: HTML scraping ───────────────────────────────────────────────

async function fetchViaScraping(username: string): Promise<MediumArticle[]> {
  const res = await fetch(`https://medium.com/@${username}`, {
    headers: FETCH_HEADERS,
  });
  if (!res.ok) throw new Error(`Profile page returned ${res.status}`);
  const html = await res.text();

  // 2a. Try __NEXT_DATA__ embedded JSON
  const nextDataMatch = html.match(/<script[^>]+id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/i);
  if (nextDataMatch?.[1]) {
    try {
      const nextData = JSON.parse(nextDataMatch[1]) as unknown;
      const articles = extractFromTree(nextData, username);
      if (articles.length > 0) {
        return articles;
      }
    } catch {
      // fall through
    }
  }

  // 2b. Try window.__APOLLO_STATE__ embedded JSON
  const apolloMatch = html.match(/window\.__APOLLO_STATE__\s*=\s*(\{[\s\S]*?\});\s*(?:<\/script>|window\.)/);
  if (apolloMatch?.[1]) {
    try {
      const apolloData = JSON.parse(apolloMatch[1]) as Record<string, unknown>;
      const articles = extractFromApolloState(apolloData, username);
      if (articles.length > 0) {
        return articles;
      }
    } catch {
      // fall through
    }
  }

  // 2c. Extract article links directly from raw HTML
  const articles = extractLinksFromHtml(html, username);
  if (articles.length === 0) throw new Error("No articles found via HTML scraping");
  return articles;
}

function extractFromTree(data: unknown, username: string, depth = 0): MediumArticle[] {
  if (depth > 20 || !data || typeof data !== "object") return [];
  if (Array.isArray(data)) {
    return data.flatMap((item) => extractFromTree(item, username, depth + 1));
  }

  const record = data as Record<string, unknown>;
  const articles: MediumArticle[] = [];

  if (typeof record.title === "string" && record.title.length > 0) {
    const rawUrl =
      (record.mediumUrl as string | undefined) ??
      (record.url as string | undefined) ??
      (record.uniqueSlug ? `https://medium.com/@${username}/${record.uniqueSlug}` : undefined);
    if (rawUrl && typeof rawUrl === "string" && rawUrl.includes("medium.com")) {
      const tags = ((record.tags as Array<{ name: string }>) ?? [])
        .map((t) => t.name ?? String(t))
        .filter(Boolean);
      articles.push({
        title: record.title,
        url: rawUrl,
        pubDate: record.firstPublishedAt
          ? new Date(record.firstPublishedAt as number).toISOString().slice(0, 10)
          : (record.publishedAt as string | undefined),
        tags,
        wordCount: record.wordCount as number | undefined,
        subtitle: record.subtitle as string | undefined,
      });
    }
  }

  for (const key of Object.keys(record)) {
    // Skip large body/content blobs to keep traversal fast
    if (key === "bodyModel" || key === "content" || key === "body") continue;
    articles.push(...extractFromTree(record[key], username, depth + 1));
  }

  // Deduplicate by URL
  const seen = new Set<string>();
  return articles.filter((a) => {
    if (seen.has(a.url)) return false;
    seen.add(a.url);
    return true;
  });
}

function extractFromApolloState(data: Record<string, unknown>, username: string): MediumArticle[] {
  const articles: MediumArticle[] = [];
  for (const value of Object.values(data)) {
    const v = value as Record<string, unknown>;
    if (v.__typename !== "Post" || typeof v.title !== "string") continue;
    const url =
      (v.mediumUrl as string | undefined) ??
      `https://medium.com/@${username}/${(v.uniqueSlug ?? v.id) as string}`;
    const tags = ((v.tags as Array<{ name: string }>) ?? [])
      .map((t) => t.name)
      .filter(Boolean);
    articles.push({
      title: v.title,
      url,
      pubDate: v.firstPublishedAt
        ? new Date(v.firstPublishedAt as number).toISOString().slice(0, 10)
        : undefined,
      tags,
      wordCount: v.wordCount as number | undefined,
      subtitle: v.subtitle as string | undefined,
    });
  }
  return articles;
}

function extractLinksFromHtml(html: string, username: string): MediumArticle[] {
  const linkRegex = new RegExp(
    `href="(https?://medium\\.com/@${username}/([a-z0-9-]+-[a-f0-9]{8,}))"`,
    "gi",
  );
  const seen = new Set<string>();
  const articles: MediumArticle[] = [];
  let match: RegExpExecArray | null;

  while ((match = linkRegex.exec(html)) !== null) {
    const url = match[1];
    if (seen.has(url)) continue;
    seen.add(url);

    // Look for a heading in the ~600 chars surrounding this link
    const pos = match.index;
    const surrounding = html.slice(Math.max(0, pos - 600), pos + 200);
    const titleMatch = surrounding.match(/<h[23][^>]*>([^<]{5,})<\/h[23]>/i);
    articles.push({
      title: titleMatch?.[1]?.trim() ?? match[2].replace(/-[a-f0-9]+$/, "").replace(/-/g, " "),
      url,
      tags: [],
    });
  }

  return articles;
}

// ─── Strategy 4: RSS fallback ─────────────────────────────────────────────────

async function fetchViaRss(
  username: string,
): Promise<{ articles: MediumArticle[]; feedDescription?: string }> {
  const res = await fetch(`https://medium.com/feed/@${username}`, {
    headers: FETCH_HEADERS,
  });
  if (!res.ok) throw new Error(`RSS returned ${res.status}`);

  const xml = await res.text();
  const feed = parseRssFeed(xml);

  const articles: MediumArticle[] = feed.items.map((item) => ({
    title: item.title,
    url: item.link,
    pubDate: item.pubDate ? new Date(item.pubDate).toISOString().slice(0, 10) : undefined,
    tags: item.categories,
    content: rssHtmlToText(item.content) || rssHtmlToText(item.description),
  }));

  return { articles, feedDescription: feed.description };
}

// ─── Generator ────────────────────────────────────────────────────────────────

export const mediumGenerator: GeneratorSource = {
  name: "medium",
  flag: "medium",
  flagArg: "<username>",
  description: "Medium articles and categories (JSON → scraping → RSS)",
  category: "writing",

  async generate(config): Promise<PartialProfile> {
    const rawUsername = config.username as string;
    const username = normalizeMediumUsername(rawUsername);
    if (!username) throw new Error("Medium username is required");

    let articles: MediumArticle[] = [];
    let feedDescription: string | undefined;
    let strategy = "unknown";

    // Strategy 1: unofficial JSON endpoint
    try {
      console.log(`  [Medium] Trying JSON endpoint for @${username}...`);
      articles = await fetchViaJson(username);
      strategy = "json";
      console.log(`  [Medium] JSON: found ${articles.length} articles.`);
    } catch (err) {
      console.log(`  [Medium] JSON endpoint failed: ${(err as Error).message}`);
    }

    // Strategy 2: sitemap XML
    if (articles.length === 0) {
      try {
        console.log(`  [Medium] Trying sitemap for @${username}...`);
        articles = await fetchViaSitemap(username);
        strategy = "sitemap";
        console.log(`  [Medium] Sitemap: found ${articles.length} articles.`);
      } catch (err) {
        console.log(`  [Medium] Sitemap failed: ${(err as Error).message}`);
      }
    }

    // Strategy 3: HTML scraping
    if (articles.length === 0) {
      try {
        console.log(`  [Medium] Trying HTML scraping for @${username}...`);
        articles = await fetchViaScraping(username);
        strategy = "scraping";
        console.log(`  [Medium] Scraping: found ${articles.length} articles.`);
      } catch (err) {
        console.log(`  [Medium] HTML scraping failed: ${(err as Error).message}`);
      }
    }

    // Strategy 4: RSS fallback
    if (articles.length === 0) {
      console.log(`  [Medium] Falling back to RSS for @${username}...`);
      const result = await fetchViaRss(username);
      articles = result.articles;
      feedDescription = result.feedDescription;
      strategy = "rss";
      console.log(`  [Medium] RSS: found ${articles.length} articles (capped at 10 by Medium).`);
    }

    console.log(`  [Medium] Using strategy: ${strategy} — ${articles.length} total articles.`);

    // Build tag counts across all articles
    const tagCounts: Record<string, number> = {};
    for (const article of articles) {
      for (const tag of article.tags) {
        tagCounts[tag] = (tagCounts[tag] ?? 0) + 1;
      }
    }

    const topTags = Object.entries(tagCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 15);

    const technical = topTags.map(([tag, count]) => ({
      name: tag,
      category: "topic",
      description: `Written about in ${count} Medium article(s)`,
    }));

    const totalWordCount = articles.reduce((sum, a) => {
      return sum + (a.wordCount ?? countWords(a.content ?? ""));
    }, 0);
    const averageWordCount =
      articles.length > 0 ? Math.round(totalWordCount / articles.length) : 0;

    const projects = articles.map((a) => ({
      name: a.title,
      description: a.subtitle || a.content || a.title,
      url: a.url,
      status: "completed" as const,
      technologies: a.tags,
      start_date: a.pubDate,
      category: "article",
    }));

    const identity: PartialProfile["identity"] = {
      contact: {
        social: [{ platform: "medium", url: `https://medium.com/@${username}`, username }],
      },
    };

    const interests: PartialProfile["interests"] = {
      topics: topTags.slice(0, 10).map(([tag]) => tag),
    };

    const faq: PartialProfile["faq"] =
      articles.length > 0
        ? [
            {
              question: "Do you write on Medium?",
              answer: `Yes, I've published ${articles.length} articles on Medium covering topics like ${topTags
                .slice(0, 5)
                .map(([t]) => t)
                .join(", ")}.${averageWordCount > 0 ? ` My posts average about ${averageWordCount} words each.` : ""}${feedDescription ? ` ${summarizeText(rssHtmlToText(feedDescription), 180)}` : ""}`,
              category: "content",
            },
            {
              question: "What do you usually write about on Medium?",
              answer:
                topTags.length > 0
                  ? `Mostly ${topTags
                      .slice(0, 8)
                      .map(([tag]) => tag)
                      .join(", ")}.`
                  : "I publish technical and personal essays on Medium.",
              category: "content",
            },
          ]
        : [];

    return {
      identity,
      skills: { technical },
      projects,
      interests,
      faq,
    };
  },
};
