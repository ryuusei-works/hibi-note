import test from "node:test";
import assert from "node:assert/strict";
import snapshot from "../src/data/sports.json" with { type: "json" };
import { getSportsData, isSportsData } from "../src/services/sports-data.ts";

test("rejects malformed data, falls back offline, then caches valid sports data", async () => {
  assert.equal(isSportsData({}), false);
  assert.equal(isSportsData({ ...snapshot, year: "2026" }), false);
  assert.equal(isSportsData(snapshot), true);
  const originalFetch = globalThis.fetch;
  let requests = 0;
  try {
    globalThis.fetch = async () => {
      requests++;
      throw new Error("offline");
    };
    const offline = await getSportsData();
    assert.equal(offline.state, "fallback");
    assert.equal(offline.data.year, snapshot.year);
    globalThis.fetch = async (url) => {
      if (String(url).includes("jfa.jp"))
        return new Response("unavailable", { status: 503 });
      assert.equal(String(url), "https://ryuusei-works.github.io/hibi-note/data/sports.json");
      requests++;
      return Response.json(snapshot);
    };
    const [first, simultaneous] = await Promise.all([
      getSportsData(),
      getSportsData(),
    ]);
    assert.equal(first.state, "fresh");
    assert.equal(simultaneous.state, "busy");
    assert.equal(requests, 2, "only one upstream request per concurrent batch");
    const cached = await getSportsData();
    assert.equal(cached.state, "cached");
    assert.equal(requests, 2);
  } finally {
    globalThis.fetch = originalFetch;
  }
});
