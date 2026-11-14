import test from "node:test";
import assert from "node:assert/strict";
import { createNewsService, parseNewsFeed } from "../src/services/news-data.ts";

const now = new Date("2026-11-13T08:40:00Z");
const item = (
  title: string,
  url = "https://news.yahoo.co.jp/pickup/1",
  published = "Fri, 13 Nov 2026 08:33:00 GMT",
) =>
  `<item><title>${title}</title><link>${url}</link><pubDate>${published}</pubDate></item>`;
const feed = (items: string) =>
  `<rss version="2.0"><channel>${items}</channel></rss>`;

test("RSS parser decodes titles, validates links and dates, and separates football coverage", () => {
  const result = parseNewsFeed(
    feed(
      item("<![CDATA[最新 &amp; 経済]]>") +
        item("重複") +
        item("危険なリンク", "javascript:alert(1)") +
        item("別ドメイン", "https://example.com/news") +
        item(
          "未配信",
          "https://news.yahoo.co.jp/pickup/2",
          "Fri, 13 Nov 2026 10:00:00 GMT",
        ) +
        item("日付不明", "https://news.yahoo.co.jp/pickup/3", "invalid"),
    ),
    now,
  );
  assert.deepEqual(result, [
    {
      title: "最新 & 経済",
      url: "https://news.yahoo.co.jp/pickup/1",
      publishedAt: "2026-11-13T08:33:00.000Z",
      date: "2026-11-13",
    },
  ]);
  assert.throws(() => parseNewsFeed("<html>login</html>", now));
  const soccer = feed(
    item("海外", "https://web.gekisaka.jp/news/world/detail/?1") +
      item("国内", "https://web.gekisaka.jp/news/jleague/detail/?2"),
  );
  assert.equal(parseNewsFeed(soccer, now, "overseas")[0].title, "海外");
  assert.equal(parseNewsFeed(soccer, now, "domestic")[0].title, "国内");
});

test("news bypasses the frozen sports API, refreshes after one minute, and preserves honest timestamps offline", async () => {
  let instant = now;
  let offline = false;
  let revision = 1;
  const calls: string[] = [];
  const getNews = createNewsService(
    async (input) => {
      const url = String(input);
      calls.push(url);
      if (offline) throw Error("offline");
      await Promise.resolve();
      return new Response(
        feed(
          item(`17時台のニュース ${revision}`) +
            item("海外", "https://web.gekisaka.jp/news/world/detail/?1"),
        ),
      );
    },
    () => instant,
  );
  const [first, concurrent] = await Promise.all([getNews("13"), getNews("13")]);
  assert.equal(first.nationalNews.data[0].title, "17時台のニュース 1");
  assert.equal(first.nationalNews.fetchedAt, now.toISOString());
  assert.deepEqual(first, concurrent);
  assert.ok(calls.every((url) => !url.includes("japan-sports-desk")));
  assert.equal(
    calls.filter((url) => url === "https://web.gekisaka.jp/feed").length,
    1,
  );
  const count = calls.length;
  await getNews("13");
  assert.equal(calls.length, count);
  revision = 2;
  const forced = await getNews("13", true);
  assert.equal(forced.nationalNews.data[0].title, "17時台のニュース 2");
  instant = new Date(now.getTime() + 61_000);
  revision = 3;
  const updated = await getNews("13");
  assert.equal(updated.nationalNews.data[0].title, "17時台のニュース 3");
  assert.equal(updated.nationalNews.fetchedAt, instant.toISOString());
  instant = new Date(now.getTime() + 122_000);
  offline = true;
  const fallback = await getNews("13");
  assert.equal(fallback.nationalNews.stale, true);
  assert.equal(fallback.nationalNews.data[0].title, "17時台のニュース 3");
  assert.equal(fallback.nationalNews.fetchedAt, updated.nationalNews.fetchedAt);
});
