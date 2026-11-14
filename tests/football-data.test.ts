import test from "node:test";
import assert from "node:assert/strict";
import snapshot from "../src/data/sports.json" with { type: "json" };
import {
  parseJfaKickoffs,
  enrichFootballKickoffs,
} from "../src/services/football-data.ts";
import { kickoffInstant, matchCountdown } from "../src/utils/matches.js";

// The second Japan fixture follows a non-Japan fixture sharing a rowspan date.
const official = `<table><tr><th>日程</th><th>キックオフ<br>（日本時間）</th><th>対戦</th><th>放送</th></tr>
<tr><td>11/14(土)</td><td>19:15</td><td>SAMURAI BLUE 対 ブラジル代表</td><td></td></tr>
<tr><td rowspan="2">11/17(火)</td><td>19:00</td><td>シンガポール代表 対 ブラジル代表</td><td></td></tr>
<tr><td>22:10</td><td>SAMURAI BLUE 対 パラグアイ代表</td><td></td></tr></table>`;

test("JFA parsing uses the Japanese kickoff column and handles rowspan without mixing other teams", () => {
  assert.deepEqual(
    parseJfaKickoffs(official).map(({ day, time }) => [day, time]),
    [
      [14, "19:15"],
      [17, "22:10"],
    ],
  );
  assert.deepEqual(
    parseJfaKickoffs(official.replace("日本時間", "現地時間")),
    [],
  );
});

test("official times replace blank or incorrect upstream values and survive an upstream failure", async () => {
  const input = structuredClone(snapshot);
  const brazil = input.footballGames.data.find((g) => g.date === "2026-11-14")!;
  brazil.time = "18:15";
  const paraguay = input.footballGames.data.find(
    (g) => g.date === "2026-11-17",
  )!;
  paraguay.time = "";
  const urls: string[] = [];
  const result = await enrichFootballKickoffs(input, undefined, async (url) => {
    urls.push(String(url));
    return new Response(
      String(url).includes("20261117") ? official : "not published",
    );
  });
  const games = (result.footballGames as typeof snapshot.footballGames).data;
  assert.equal(games.find((g) => g.date === "2026-11-14")!.time, "19:15");
  assert.equal(games.find((g) => g.date === "2026-11-17")!.time, "22:10");
  assert.equal(
    urls.filter((url) => url.includes("20261117")).length,
    1,
    "one fetch per tournament",
  );
  assert.equal(brazil.time, "18:15", "does not mutate the original response");
  brazil.time = "";
  const offline = await enrichFootballKickoffs(input, result, async () => {
    throw Error("offline");
  });
  assert.equal(
    (offline.footballGames as typeof snapshot.footballGames).data.find(
      (g) => g.date === "2026-11-14",
    )!.time,
    "19:15",
  );
  assert.equal(
    (offline.footballGames as typeof snapshot.footballGames).data.find(
      (g) => g.date === "2026-12-30",
    )!.time,
    "",
  );
});

test("countdowns use JST, agree on days/hours/minutes and never substitute midnight for unknown kickoff", () => {
  const game = { date: "2026-11-14", time: "19:15" };
  assert.equal(kickoffInstant(game), Date.parse("2026-11-14T10:15:00Z"));
  assert.deepEqual(matchCountdown(game, Date.parse("2026-11-13T08:15:00Z")), {
    status: "upcoming",
    kickoff: Date.parse("2026-11-14T10:15:00Z"),
    days: 1,
    hours: 2,
    minutes: 0,
  });
  assert.equal(
    matchCountdown(game, Date.parse("2026-11-14T10:15:00Z")).status,
    "started",
  );
  for (const time of ["", "未定", "24:00", "19:60"])
    assert.deepEqual(matchCountdown({ date: game.date, time }), {
      status: "unknown",
    });
  assert.equal(
    kickoffInstant({ date: "2027-01-01", time: "0:10" }),
    Date.parse("2026-12-31T15:10:00Z"),
  );
});
