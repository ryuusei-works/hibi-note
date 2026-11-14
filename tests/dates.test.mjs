import test from "node:test";
import assert from "node:assert/strict";
import { formatDate, formatDateTime } from "../src/utils/dates.js";

test("dates read naturally in Japanese, including month ranges and missing values", () => {
  assert.equal(formatDate("2026-10-10"), "2026年10月10日");
  assert.equal(formatDate("2026-01-02"), "2026年1月2日");
  assert.equal(formatDate("2026-10"), "2026年10月");
  assert.equal(formatDate("未定"), "未定");
  assert.equal(formatDate(null), "");
});

test("timestamps use Japan time across day and year boundaries", () => {
  assert.equal(formatDateTime("2026-10-10T23:30:00Z"), "2026年10月11日 08:30");
  assert.equal(formatDateTime("2026-12-31T15:05:00Z"), "2027年1月1日 00:05");
  assert.equal(formatDateTime("2026-10-10"), "2026年10月10日");
  assert.equal(formatDateTime("未取得"), "未取得");
});
