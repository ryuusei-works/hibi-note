import { parseFragment } from "parse5";
import snapshot from "@/data/sports.json" with { type: "json" };

const CACHE_MS = 60_000;
const MAX_FEED_BYTES = 1_000_000;
type NewsItem = {
  title: string;
  url: string;
  publishedAt: string;
  date: string;
};
type Source = {
  ok: boolean;
  data: NewsItem[];
  source: string;
  publisher: string;
  fetchedAt?: string;
  stale?: boolean;
};
type Feed = {
  url: string;
  source: string;
  publisher: string;
  section?: "domestic" | "overseas";
};
const yahoo = (path: string, source: string): Feed => ({
  url: `https://news.yahoo.co.jp/rss/${path}.xml`,
  source,
  publisher: "Yahoo!ニュース",
});
const feeds: Record<string, Feed> = {
  general: yahoo("topics/top-picks", "https://news.yahoo.co.jp/"),
  ...Object.fromEntries(
    Object.entries({
      domestic: "domestic",
      world: "world",
      technology: "it",
      science: "science",
      life: "life",
      economy: "business",
      entertainment: "entertainment",
    }).map(([key, category]) => [
      key,
      yahoo(
        `categories/${category}`,
        `https://news.yahoo.co.jp/categories/${category}`,
      ),
    ]),
  ),
  baseball: yahoo(
    "media/fullcount/all",
    "https://news.yahoo.co.jp/media/fullcount",
  ),
  "domestic-soccer": {
    url: "https://web.gekisaka.jp/feed",
    source: "https://web.gekisaka.jp/domestic",
    publisher: "ゲキサカ",
    section: "domestic",
  },
  "overseas-soccer": {
    url: "https://web.gekisaka.jp/feed",
    source: "https://web.gekisaka.jp/foreign",
    publisher: "ゲキサカ",
    section: "overseas",
  },
};
const japanDay = (date: Date) =>
  new Intl.DateTimeFormat("sv-SE", { timeZone: "Asia/Tokyo" }).format(date);
function text(value: string) {
  return parseFragment(
    value.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1").replace(/<[^>]*>/g, ""),
  )
    .childNodes.map((node) => ("value" in node ? node.value : ""))
    .join("")
    .trim();
}
export function parseNewsFeed(
  xml: string,
  now: Date,
  section?: Feed["section"],
): NewsItem[] {
  if (
    xml.length > MAX_FEED_BYTES ||
    !/<rss[\s>]/i.test(xml) ||
    !/<channel[\s>]/i.test(xml)
  )
    throw Error("Invalid news feed");
  const items: NewsItem[] = [];
  const seen = new Set<string>();
  for (const match of xml.matchAll(/<item\b[^>]*>([\s\S]*?)<\/item>/gi)) {
    const field = (name: string) =>
      text(
        match[1].match(
          new RegExp(`<${name}\\b[^>]*>([\\s\\S]*?)<\\/${name}>`, "i"),
        )?.[1] || "",
      );
    const title = field("title"),
      url = field("link"),
      published = new Date(field("pubDate"));
    if (
      !title ||
      title.length > 500 ||
      !Number.isFinite(published.getTime()) ||
      published.getTime() > now.getTime() ||
      seen.has(url)
    )
      continue;
    try {
      const parsed = new URL(url);
      if (
        parsed.protocol !== "https:" ||
        !["news.yahoo.co.jp", "web.gekisaka.jp"].includes(parsed.hostname) ||
        parsed.username ||
        parsed.password
      )
        continue;
      if (section) {
        const overseas =
          /\/(?:world|spain|england|italy|germany|france|championsleague)\//.test(
            parsed.pathname,
          );
        if (section === "overseas" ? !overseas : overseas) continue;
      }
    } catch {
      continue;
    }
    seen.add(url);
    items.push({
      title,
      url,
      publishedAt: published.toISOString(),
      date: japanDay(published),
    });
  }
  return items.slice(0, 30);
}

/** News has its own short cache; the sports snapshot never determines news freshness. */
export function createNewsService(
  fetcher: typeof fetch = fetch,
  clock = () => new Date(),
) {
  const cache = new Map<string, { source: Source; checkedAt: number }>();
  const inflight = new Map<string, Promise<Source>>();
  const downloads = new Map<string, Promise<string>>();
  async function load(
    key: string,
    feed: Feed,
    force: boolean,
    fallback?: Source,
  ) {
    const stored = cache.get(key);
    if (!force && stored && clock().getTime() - stored.checkedAt < CACHE_MS)
      return stored.source;
    if (inflight.has(key)) return inflight.get(key)!;
    const request = (async () => {
      try {
        let download = downloads.get(feed.url);
        if (!download) {
          download = (async () => {
            const response = await fetcher(feed.url, {
              cache: "no-store",
              signal: AbortSignal.timeout(8000),
            });
            if (!response.ok) throw Error("News unavailable");
            if (Number(response.headers.get("content-length")) > MAX_FEED_BYTES)
              throw Error("News feed too large");
            return response.text();
          })();
          downloads.set(feed.url, download);
          void download
            .finally(() => downloads.delete(feed.url))
            .catch(() => {});
        }
        const now = clock();
        const data = parseNewsFeed(await download, now, feed.section);
        if (!data.length) throw Error("Empty news feed");
        const source: Source = {
          ok: true,
          data,
          source: feed.source,
          publisher: feed.publisher,
          fetchedAt: now.toISOString(),
          stale: false,
        };
        cache.set(key, { source, checkedAt: now.getTime() });
        return source;
      } catch {
        const previous = stored?.source || fallback;
        const source: Source = previous?.ok
          ? { ...previous, stale: true }
          : {
              ok: false,
              data: [],
              source: feed.source,
              publisher: feed.publisher,
              stale: true,
            };
        // Retry on the next poll without making a stale response appear newly fetched.
        return source;
      }
    })();
    inflight.set(key, request);
    try {
      return await request;
    } finally {
      inflight.delete(key);
    }
  }
  return async (region = "13", force = false) => {
    const bundled = snapshot.daily;
    const location =
      bundled.locations[region as keyof typeof bundled.locations];
    const regionalSource = location?.news.source;
    const media = regionalSource?.match(
      /^https:\/\/news\.yahoo\.co\.jp\/media\/([a-z0-9_-]+)$/,
    )?.[1];
    const entries = Object.entries(feeds);
    if (media)
      entries.push(["local", yahoo(`media/${media}/all`, regionalSource)]);
    const results = await Promise.all(
      entries.map(async ([key, feed]) => {
        const fallback =
          key === "general"
            ? bundled.nationalNews
            : key === "local"
              ? undefined
              : bundled.newsCategories[
                  key as keyof typeof bundled.newsCategories
                ];
        return [
          key,
          await load(
            key === "local" ? `local:${region}` : key,
            feed,
            force,
            fallback as Source | undefined,
          ),
        ] as const;
      }),
    );
    const sources = Object.fromEntries(results);
    return {
      nationalNews: sources.general,
      newsCategories: Object.fromEntries(
        results.filter(([key]) => !["general", "local"].includes(key)),
      ),
      locations: media
        ? {
            [region]: {
              news: {
                ...sources.local,
                data: {
                  items: sources.local.data,
                  publisher: sources.local.publisher,
                  coverage: "選択地域の配信元",
                },
              },
            },
          }
        : {},
    };
  };
}
export const getNewsData = createNewsService();
