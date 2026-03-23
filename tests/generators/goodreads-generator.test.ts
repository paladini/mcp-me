import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { goodreadsGenerator } from "../../src/generators/goodreads.js";

const AUTHOR_HTML = `
<html>
  <head><title>Jane Example (Author of Sample Book)</title></head>
  <body>
    <div class="aboutAuthorInfo">Author of practical engineering books and essays.</div>
    <table>
      <tr itemscope itemtype="https://schema.org/Book">
        <td><a class="bookTitle" href="/book/show/111.Sample_Book">Sample Book</a></td>
        <td><span itemprop="ratingValue">4.31</span></td>
        <td><meta itemprop="ratingCount">12,345</meta></td>
      </tr>
      <tr itemscope itemtype="https://schema.org/Book">
        <td><a class="bookTitle" href="/book/show/222.Next_Book">Next Book</a></td>
        <td><span itemprop="ratingValue">4.00</span></td>
        <td><meta itemprop="ratingCount">1,200</meta></td>
      </tr>
    </table>
    <p>67,890 ratings</p>
    <p>3,210 reviews</p>
  </body>
</html>`;

const READER_RSS = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>Goodreads read shelf</title>
    <item>
      <title><![CDATA[Clean Architecture]]></title>
      <link>https://www.goodreads.com/book/show/101.clean-architecture</link>
      <description><![CDATA[
        <user_rating>5</user_rating>
        <author_name>Robert C. Martin</author_name>
        <user_review><![CDATA[Excellent guidance for maintainable systems.]]></user_review>
        <user_date_added>Mon, 11 Mar 2024 12:00:00 GMT</user_date_added>
        <user_shelves><shelf name="read"/><shelf name="software"/></user_shelves>
      ]]></description>
    </item>
    <item>
      <title><![CDATA[The Pragmatic Programmer]]></title>
      <link>https://www.goodreads.com/book/show/102.pragmatic-programmer</link>
      <description><![CDATA[
        <user_rating>4</user_rating>
        <author_name>Andrew Hunt</author_name>
        <user_review><![CDATA[Still relevant and practical.]]></user_review>
        <user_date_added>Tue, 12 Mar 2024 12:00:00 GMT</user_date_added>
        <user_shelves><shelf name="read"/><shelf name="engineering"/></user_shelves>
      ]]></description>
    </item>
  </channel>
</rss>`;

describe("goodreadsGenerator", () => {
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

  it("enriches author profiles with books, ratings and author bio", async () => {
    globalThis.fetch = vi.fn(async (url: string) => {
      if (url.includes("/author/show/16062300")) {
        return { ok: true, text: async () => AUTHOR_HTML };
      }
      return { ok: false, status: 404, statusText: "Not Found" };
    }) as unknown as typeof globalThis.fetch;

    const profile = await goodreadsGenerator.generate({ username: "16062300" });

    expect(profile.identity?.name).toBe("Jane Example");
    expect(profile.identity?.bio).toContain("practical engineering books");
    expect(profile.identity?.contact?.social).toContainEqual({
      platform: "goodreads",
      url: "https://www.goodreads.com/author/show/16062300",
      username: "16062300",
    });

    expect(profile.projects).toHaveLength(2);
    expect(profile.projects?.[0]).toMatchObject({
      name: "Sample Book",
      category: "book",
      stars: 12345,
      status: "completed",
    });
    expect(profile.projects?.[0]?.description).toContain("Average rating 4.31");
    expect(profile.faq?.[0]?.answer).toContain("67,890 ratings");
  });

  it("enriches reader profiles with read books, shelves and reviews", async () => {
    globalThis.fetch = vi.fn(async (url: string) => {
      if (url.includes("/author/show/99999")) {
        return { ok: false, status: 404, statusText: "Not Found" };
      }
      if (url.includes("/review/list_rss/99999")) {
        return { ok: true, text: async () => READER_RSS };
      }
      return { ok: false, status: 404, statusText: "Not Found" };
    }) as unknown as typeof globalThis.fetch;

    const profile = await goodreadsGenerator.generate({ username: "99999.ReaderName" });

    expect(profile.identity?.contact?.social).toContainEqual({
      platform: "goodreads",
      url: "https://www.goodreads.com/user/show/99999",
      username: "99999",
    });
    expect(profile.projects).toHaveLength(2);
    expect(profile.projects?.[0]?.name).toContain("Clean Architecture");
    expect(profile.projects?.[0]?.description).toContain("5/5");
    expect(profile.projects?.[0]?.description).toContain("software");
    expect(profile.projects?.[0]?.description).toContain("Excellent guidance");
    expect(profile.projects?.[0]?.start_date).toBe("2024-03-11");
    expect(profile.projects?.[0]?.category).toBe("book");
    expect(profile.interests?.topics).toEqual(expect.arrayContaining(["books", "literature", "read"]));
    expect(profile.faq?.[0]?.answer).toContain("Top rated");
    expect(profile.faq?.[1]?.answer).toContain("shelves include");
  });
});
