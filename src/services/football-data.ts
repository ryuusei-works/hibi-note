import { parse, type DefaultTreeAdapterMap } from "parse5";
import type { SportsData } from "@/types";

type Node = DefaultTreeAdapterMap["node"];
type Game = {
  date: string;
  time: string;
  opponent: string;
  url: string;
  status: string;
  timeSource?: string;
};
type Source = { ok: boolean; data: Game[]; [key: string]: unknown };
type Kickoff = { month: number; day: number; time: string; teams: string };
function descendants(
  node: Node,
  tag: string,
): DefaultTreeAdapterMap["element"][] {
  const children = "childNodes" in node ? node.childNodes : [];
  return children.flatMap((child) => [
    ...("tagName" in child && child.tagName === tag ? [child] : []),
    ...descendants(child, tag),
  ]);
}
function text(node: Node): string {
  if ("value" in node && node.nodeName === "#text") return node.value;
  return "childNodes" in node
    ? node.childNodes.map(text).join(" ").replace(/\s+/g, " ").trim()
    : "";
}
/** Never interpret a local-time match page as Japan time. Require an explicit JST column. */
export function parseJfaKickoffs(html: string): Kickoff[] {
  const found: Kickoff[] = [];
  for (const table of descendants(parse(html), "table")) {
    const rows = descendants(table, "tr");
    const headers = rows.flatMap((row) => descendants(row, "th").map(text));
    const timeColumn = headers.findIndex(
      (value) => /キックオフ/.test(value) && /日本時間/.test(value),
    );
    const dateColumn = headers.findIndex((value) => /日程|日付/.test(value));
    const teamColumn = headers.findIndex((value) => /対戦/.test(value));
    if ([timeColumn, dateColumn, teamColumn].some((index) => index < 0))
      continue;
    const spans = new Map<number, { value: string; left: number }>();
    for (const row of rows) {
      const cells = descendants(row, "td");
      if (!cells.length) continue;
      const values: string[] = [];
      let index = 0;
      for (let column = 0; column < headers.length; column++) {
        const span = spans.get(column);
        if (span) {
          values[column] = span.value;
          if (--span.left === 0) spans.delete(column);
        } else {
          const cell = cells[index++];
          if (!cell) continue;
          values[column] = text(cell);
          const rows = Number(
            cell.attrs.find((attr) => attr.name === "rowspan")?.value || 1,
          );
          if (rows > 1)
            spans.set(column, { value: values[column], left: rows - 1 });
        }
      }
      const date = values[dateColumn]?.match(/(\d{1,2})[月/]\s*(\d{1,2})/);
      const time = values[timeColumn]?.match(/\b([01]?\d|2[0-3]):([0-5]\d)\b/);
      const teams = values[teamColumn] || "";
      if (
        date &&
        time &&
        /SAMURAI BLUE|日本代表|日本\s*[対vsＶＳ]/i.test(teams)
      )
        found.push({
          month: Number(date[1]),
          day: Number(date[2]),
          time: `${time[1].padStart(2, "0")}:${time[2]}`,
          teams,
        });
    }
  }
  return found;
}
function sourceOf(data: SportsData): Source | undefined {
  const source = data.footballGames as Source | undefined;
  return source?.ok && Array.isArray(source.data) ? source : undefined;
}
export async function enrichFootballKickoffs(
  data: SportsData,
  previous?: SportsData,
  fetcher: typeof fetch = fetch,
): Promise<SportsData> {
  const source = sourceOf(data);
  if (!source) return data;
  const games = source.data;
  const urls = [
    ...new Set(
      games
        .filter((game) => game.status === "scheduled")
        .flatMap((game) => {
          try {
            const url = new URL(game.url);
            return url.protocol === "https:" &&
              ["www.jfa.jp", "jfa.jp"].includes(url.hostname) &&
              /^\/samuraiblue\/[^/]+\/$/.test(url.pathname)
              ? [new URL("tv.html", url).href]
              : [];
          } catch {
            return [];
          }
        }),
    ),
  ];
  const results = await Promise.all(
    urls.map(async (url) => {
      try {
        const response = await fetcher(url, {
          cache: "no-store",
          signal: AbortSignal.timeout(8000),
        });
        if (!response.ok) return [];
        return parseJfaKickoffs(await response.text()).map((kickoff) => ({
          ...kickoff,
          source: url,
        }));
      } catch {
        return [];
      }
    }),
  );
  const official = results.flat();
  const previousGames = sourceOf(previous || data)?.data || [];
  const updated = games.map((game) => {
    if (game.status !== "scheduled") return game;
    const [, month, day] = game.date.split("-").map(Number);
    const kickoff = official.find(
      (entry) =>
        entry.month === month &&
        entry.day === day &&
        entry.teams.includes(game.opponent) &&
        game.url.replace(/\/$/, "/tv.html") === entry.source,
    );
    if (kickoff)
      return { ...game, time: kickoff.time, timeSource: kickoff.source };
    const saved = previousGames.find(
      (old) =>
        old.date === game.date &&
        old.opponent === game.opponent &&
        old.timeSource &&
        old.time,
    );
    return !game.time && saved
      ? { ...game, time: saved.time, timeSource: saved.timeSource }
      : game;
  });
  return { ...data, footballGames: { ...source, data: updated } };
}
