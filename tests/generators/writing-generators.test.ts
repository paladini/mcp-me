import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { mediumGenerator } from "../../src/generators/medium.js";
import { substackGenerator } from "../../src/generators/substack.js";

const MEDIUM_FEED = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:content="http://purl.org/rss/1.0/modules/content/" xmlns:dc="http://purl.org/dc/elements/1.1/">
  <channel>
    <title><![CDATA[Stories by Example Writer on Medium]]></title>
    <link>https://medium.com/@example-writer</link>
    <description><![CDATA[Essays about software &amp; writing.]]></description>
    <item>
      <title><![CDATA[Deep Work with MCP]]></title>
      <link>https://medium.com/@example-writer/deep-work</link>
      <pubDate>Sun, 23 Mar 2026 10:00:00 GMT</pubDate>
      <description><![CDATA[<p>Short summary with <strong>markup</strong>.</p>]]></description>
      <content:encoded><![CDATA[<p>First paragraph about craft.</p><p>Second paragraph with style signals.</p>]]></content:encoded>
      <category><![CDATA[typescript]]></category>
      <category><![CDATA[writing]]></category>
    </item>
    <item>
      <title><![CDATA[Shipping better docs]]></title>
      <link>https://medium.com/@example-writer/docs</link>
      <pubDate>Sat, 22 Mar 2026 10:00:00 GMT</pubDate>
      <description><![CDATA[<p>Documentation article.</p>]]></description>
      <content:encoded><![CDATA[<p>Documentation deserves narrative care.</p>]]></content:encoded>
      <category><![CDATA[writing]]></category>
      <category><![CDATA[documentation]]></category>
    </item>
  </channel>
</rss>`;

const SUBSTACK_FEED = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:content="http://purl.org/rss/1.0/modules/content/">
  <channel>
    <title><![CDATA[Builder Notes]]></title>
    <link>https://buildernotes.substack.com</link>
    <description><![CDATA[Notes on product strategy &amp; engineering.]]></description>
    <item>
      <title><![CDATA[Issue 1]]></title>
      <link>https://buildernotes.substack.com/p/issue-1</link>
      <pubDate>Sun, 23 Mar 2026 08:00:00 GMT</pubDate>
      <description><![CDATA[<p>Preview text only.</p>]]></description>
      <content:encoded><![CDATA[<p>Full newsletter body.</p><ul><li>Point one</li><li>Point two</li></ul>]]></content:encoded>
      <category>product</category>
      <category>leadership</category>
    </item>
  </channel>
</rss>`;

describe("writing RSS generators", () => {
  let originalFetch: typeof globalThis.fetch;
  let originalConsoleLog: typeof console.log;

  beforeEach(() => {
    originalFetch = globalThis.fetch;
    originalConsoleLog = console.log;
    console.log = vi.fn();
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
    console.log = originalConsoleLog;
  });

  it("enriches Medium articles with full text and normalizes @usernames", async () => {
    const fetchMock = vi.fn(async (url: string) => ({
      ok: true,
      text: async () => MEDIUM_FEED,
      url,
    }));
    globalThis.fetch = fetchMock as unknown as typeof globalThis.fetch;

    const profile = await mediumGenerator.generate({ username: "@example-writer" });

    expect(fetchMock).toHaveBeenCalledWith(
      "https://medium.com/feed/@example-writer",
      expect.objectContaining({ headers: { "User-Agent": "mcp-me-generator" } }),
    );
    expect(profile.identity?.contact?.social).toContainEqual({
      platform: "medium",
      url: "https://medium.com/@example-writer",
      username: "example-writer",
    });
    expect(profile.projects).toHaveLength(2);
    expect(profile.projects?.[0]?.description).toContain("First paragraph about craft.");
    expect(profile.projects?.[0]?.description).toContain("Second paragraph with style signals.");
    expect(profile.projects?.[0]?.description).not.toContain("<p>");
    expect(profile.skills?.technical).toContainEqual(expect.objectContaining({ name: "writing" }));
    expect(profile.faq?.[0]?.answer).toContain("average about");
    expect(profile.faq?.[0]?.answer).toContain("Feed summary: Essays about software & writing.");
  });

  it("enriches Substack posts with body text and publication summary", async () => {
    globalThis.fetch = vi.fn(async () => ({
      ok: true,
      text: async () => SUBSTACK_FEED,
    })) as unknown as typeof globalThis.fetch;

    const profile = await substackGenerator.generate({ username: "buildernotes" });

    expect(profile.identity?.contact?.social).toContainEqual({
      platform: "substack",
      url: "https://buildernotes.substack.com",
      username: "buildernotes",
    });
    expect(profile.projects).toHaveLength(1);
    expect(profile.projects?.[0]?.description).toContain("Full newsletter body.");
    expect(profile.projects?.[0]?.description).toContain("- Point one");
    expect(profile.projects?.[0]?.description).toContain("- Point two");
    expect(profile.projects?.[0]?.category).toBe("newsletter");
    expect(profile.faq?.[0]?.answer).toContain("Publication summary: Notes on product strategy & engineering.");
    expect(profile.faq?.[1]?.answer).toContain("product");
  });
});
