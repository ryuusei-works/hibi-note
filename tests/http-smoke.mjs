// Run against a built, running app: node tests/http-smoke.mjs http://127.0.0.1:3100
import assert from "node:assert/strict";
const base = process.argv[2] || "http://127.0.0.1:3000";
const routes = [
  "/",
  "/news",
  "/baseball",
  "/football",
  "/draft",
  "/schedule",
  "/links",
  "/settings",
  "/guide",
];
await Promise.all(
  routes.map(async (route) => {
    const response = await fetch(new URL(route, base));
    assert.equal(response.status, 200, route);
    const html = await response.text();
    assert.ok(html.includes("Hibi Sports"), route);
    assert.ok(html.includes("/_next/"), "Next.js assets: " + route);
    assert.ok(!html.includes('src="./app.js"'), "no old entry point");
    console.log("PASS " + route);
  }),
);
for (const route of ["/notes", "/missing"]) {
  const response = await fetch(new URL(route, base));
  assert.equal(response.status, 404, route);
  console.log("PASS " + route + " → 404");
}
const api = await fetch(new URL("/api/data", base));
assert.equal(api.status, 200);
assert.ok(Number.isInteger((await api.json()).year));
assert.equal(api.headers.get("cache-control"), "no-store");
console.log("PASS /api/data (" + api.headers.get("x-data-update") + ")");
const asset = await fetch(new URL("/assets/companion.png", base));
assert.equal(asset.status, 200);
console.log("PASS public asset");
