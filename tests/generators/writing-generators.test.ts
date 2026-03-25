import { mkdir, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { bloggerBackupGenerator } from "../../src/generators/blogger-backup.js";
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

const BLOGGER_EXPORT = `<?xml version="1.0" encoding="UTF-8"?>
<feed xmlns='http://www.w3.org/2005/Atom' xmlns:app='http://www.w3.org/2007/app'>
  <title type='text'>Example Blog</title>
  <link rel='alternate' type='text/html' href='https://example.blogspot.com/'/>

  <entry>
    <id>tag:blogger.com,1999:blog-123.post-1</id>
    <published>2024-05-01T10:00:00.000-03:00</published>
    <updated>2024-05-01T10:00:00.000-03:00</updated>
    <category scheme='http://schemas.google.com/g/2005#kind' term='http://schemas.google.com/blogger/2008/kind#post'/>
    <category scheme='http://www.blogger.com/atom/ns#' term='writing'/>
    <category scheme='http://www.blogger.com/atom/ns#' term='typescript'/>
    <title type='text'>First Blogger Post</title>
    <content type='html'><![CDATA[<p>First article body.</p><p>With useful details.</p>]]></content>
    <link rel='alternate' type='text/html' href='https://example.blogspot.com/2024/05/first-blogger-post.html'/>
    <author>
      <name>Fernando Paladini</name>
      <email>fernandopalad@gmail.com</email>
    </author>
  </entry>

  <entry>
    <id>tag:blogger.com,1999:blog-123.post-2</id>
    <published>2024-04-01T10:00:00.000-03:00</published>
    <updated>2024-04-01T10:00:00.000-03:00</updated>
    <category scheme='http://schemas.google.com/g/2005#kind' term='http://schemas.google.com/blogger/2008/kind#post'/>
    <category scheme='http://www.blogger.com/atom/ns#' term='software'/>
    <title type='text'>Second Blogger Post</title>
    <content type='html'><![CDATA[<p>Another article written by Fernando.</p>]]></content>
    <link rel='alternate' type='text/html' href='https://example.blogspot.com/2024/04/second-blogger-post.html'/>
    <author>
      <name>Fernando Paladini</name>
      <email>fnpaladini@gmail.com</email>
    </author>
  </entry>

  <entry>
    <id>tag:blogger.com,1999:blog-123.post-3</id>
    <published>2024-03-01T10:00:00.000-03:00</published>
    <updated>2024-03-01T10:00:00.000-03:00</updated>
    <category scheme='http://schemas.google.com/g/2005#kind' term='http://schemas.google.com/blogger/2008/kind#post'/>
    <title type='text'>Guest Post</title>
    <content type='html'><![CDATA[<p>This one belongs to someone else.</p>]]></content>
    <link rel='alternate' type='text/html' href='https://example.blogspot.com/2024/03/guest-post.html'/>
    <author>
      <name>Another Author</name>
      <email>guest@example.com</email>
    </author>
  </entry>

  <entry>
    <id>tag:blogger.com,1999:blog-123.comment-1</id>
    <published>2024-02-01T10:00:00.000-03:00</published>
    <updated>2024-02-01T10:00:00.000-03:00</updated>
    <category scheme='http://schemas.google.com/g/2005#kind' term='http://schemas.google.com/blogger/2008/kind#comment'/>
    <title type='text'>Comment Entry</title>
    <content type='html'><![CDATA[<p>This must be ignored.</p>]]></content>
    <author>
      <name>Fernando Paladini</name>
      <email>fernandopalad@gmail.com</email>
    </author>
  </entry>
</feed>`;

const TEST_DIR = join(tmpdir(), "mcp-me-writing-generators-test");

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

  afterEach(async () => {
    await rm(TEST_DIR, { recursive: true, force: true });
  });

  it("enriches Medium articles with full text and normalizes @usernames", async () => {
    const fetchMock = vi.fn(async (url: string) => ({
      ok: true,
      text: async () => MEDIUM_FEED,
      url,
    }));
    globalThis.fetch = fetchMock as unknown as typeof globalThis.fetch;

    const profile = await mediumGenerator.generate({ username: "@example-writer" });

    // The generator tries JSON → sitemap → scraping → RSS; mock returns RSS XML for all,
    // so all rich strategies fail and it ends up on RSS (which parses correctly).
    expect(fetchMock).toHaveBeenCalledWith(
      "https://medium.com/feed/@example-writer",
      expect.objectContaining({
        headers: expect.objectContaining({ "User-Agent": expect.stringContaining("Mozilla") }),
      }),
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
    expect(profile.faq?.[0]?.answer).toContain("Essays about software & writing.");
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

  it("imports authored Blogger posts from a local XML backup", async () => {
    await mkdir(TEST_DIR, { recursive: true });
    const exportPath = join(TEST_DIR, "blogger-export.xml");
    await writeFile(exportPath, BLOGGER_EXPORT, "utf-8");

    const profile = await bloggerBackupGenerator.generate({
      username: `${exportPath}::fernandopalad@gmail.com,fnpaladini@gmail.com,Fernando Paladini`,
    });

    expect(profile.identity?.contact?.social).toContainEqual({
      platform: "blogger",
      url: "https://example.blogspot.com/",
    });
    expect(profile.projects).toHaveLength(2);
    expect(profile.projects?.[0]?.category).toBe("article");
    expect(profile.projects?.[0]?.description).toContain("First article body.");
    expect(profile.projects?.[0]?.description).not.toContain("<p>");
    expect(profile.projects?.[0]?.url).toBe("https://example.blogspot.com/2024/05/first-blogger-post.html");
    expect(profile.projects?.[1]?.name).toBe("Second Blogger Post");
    expect(profile.skills?.technical).toContainEqual(expect.objectContaining({ name: "writing" }));
    expect(profile.interests?.topics).toContain("typescript");
    expect(profile.faq?.[0]?.answer).toContain("2 Blogger post");
    expect(profile.faq?.[2]?.answer).toContain("Fernando Paladini");
  });
});
