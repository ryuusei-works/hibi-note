import snapshot from "@/data/sports.json" with { type: "json" };
import { enrichFootballKickoffs } from "./football-data";
import type { SportsData } from "@/types";
const CACHE_MS = 5 * 60 * 1000;
let cache: SportsData = snapshot as unknown as SportsData;
let lastFetch = 0;
let fetching: Promise<SportsData> | undefined;
export function isSportsData(value: unknown): value is SportsData {
  if (!value || typeof value !== "object") return false;
  const data = value as Partial<SportsData>;
  return (
    Number.isInteger(data.year) &&
    typeof data.generatedAt === "string" &&
    Number.isFinite(Date.parse(data.generatedAt)) &&
    Array.isArray(data.categories) &&
    !!data.standings &&
    !!data.leaders
  );
}
export async function getSportsData() {
  if (lastFetch && Date.now() - lastFetch < CACHE_MS)
    return { data: cache, state: "cached" };
  const busy = !!fetching;
  fetching ??= (async () => {
    try {
      const response = await fetch(
        "https://ryuusei-works.github.io/hibi-note/data/sports.json",
        { cache: "no-store", signal: AbortSignal.timeout(30_000) },
      );
      if (!response.ok) throw new Error("Sports source unavailable");
      const next: unknown = await response.json();
      if (!isSportsData(next)) throw new Error("Invalid sports data");
      cache = await enrichFootballKickoffs(next, cache);
      lastFetch = Date.now();
    } catch {
      // Keep the bundled snapshot or the last valid response available offline.
    }
    return cache;
  })();
  try {
    const data = await fetching;
    return { data, state: lastFetch ? (busy ? "busy" : "fresh") : "fallback" };
  } finally {
    fetching = undefined;
  }
}
