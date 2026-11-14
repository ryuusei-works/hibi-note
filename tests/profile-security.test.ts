import test from "node:test";
import assert from "node:assert/strict";
import config from "../next.config.ts";

test("photo policy permits the JFA player image directory while retaining script restrictions", async () => {
  const rules = await config.headers!();
  const policy = rules[0].headers.find(
    (header) => header.key === "Content-Security-Policy",
  )!.value;
  const images = policy
    .split(";")
    .find((directive) => directive.trim().startsWith("img-src"))!;
  assert.ok(
    images.includes("https://www.jfa.jp/national_team/inc/member/samuraiblue/"),
  );
  assert.ok(!images.includes("*"));
  assert.ok(!images.includes("https:" + " "));
  const scripts = policy
    .split(";")
    .find((directive) => directive.trim().startsWith("script-src"))!;
  assert.ok(!scripts.includes("jfa.jp"));
});
