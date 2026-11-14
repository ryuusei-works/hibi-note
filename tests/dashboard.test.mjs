import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import React, { act, StrictMode } from "react";
import { renderToString } from "react-dom/server";
import { JSDOM } from "jsdom";
import { Dashboard } from "../src/components/Dashboard.tsx";
import { sections } from "../src/utils/navigation.ts";

const snapshot = JSON.parse(
  fs.readFileSync(new URL("../src/data/sports.json", import.meta.url), "utf8"),
);

test("all Next.js sections render as React markup without browser globals", () => {
  for (const section of sections) {
    const html = renderToString(React.createElement(Dashboard, { section }));
    const dom = new JSDOM(html);
    assert.equal(
      dom.window.document.getElementById(section).hidden,
      false,
      section,
    );
    for (const other of sections.filter((id) => id !== section))
      assert.equal(
        dom.window.document.getElementById(other).hidden,
        true,
        other,
      );
    assert.ok(html.includes("Hibi Sports"));
    assert.ok(!html.includes("iframe"));
    for (const id of [
      "workspace-session",
      "workspace-journey",
      "workspace-focus-form",
      "notes",
      "saved-news",
    ])
      assert.equal(dom.window.document.getElementById(id), null);
    const ids = [...dom.window.document.querySelectorAll("[id]")].map(
      (node) => node.id,
    );
    assert.equal(ids.length, new Set(ids).size, "unique component IDs");
    dom.window.close();
  }
});

test("hydrates with Strict Mode, retains prior data, and supports settings, links, news and backups", async (t) => {
  // The carousel only displays today's headlines; keep the fixture date stable.
  t.mock.timers.enable({ apis: ["Date"], now: new Date("2026-11-13T09:00:00Z") });
  const element = React.createElement(
    StrictMode,
    null,
    React.createElement(Dashboard, { section: "settings" }),
  );
  const dom = new JSDOM(
    '<div id="root">' + renderToString(element) + "</div>",
    { url: "http://localhost:3000/settings", pretendToBeVisual: true },
  );
  const w = dom.window;
  const errors = [];
  w.addEventListener("error", (event) => errors.push(event.message));
  w.scrollTo = () => {};
  w.matchMedia = () => ({
    matches: false,
    addEventListener() {},
    removeEventListener() {},
  });
  w.HTMLElement.prototype.scrollIntoView = () => {};
  w.HTMLDialogElement.prototype.showModal = function () {
    this.open = true;
  };
  w.HTMLDialogElement.prototype.close = function () {
    this.open = false;
    this.dispatchEvent(new w.Event("close"));
  };
  w.HTMLCanvasElement.prototype.getContext = () => null;
  const newsRequests = [];
  const sportsPayload = structuredClone(snapshot);
  const liveDaily = structuredClone(snapshot.daily);
  liveDaily.nationalNews.fetchedAt = "2026-11-13T08:40:00.000Z";
  liveDaily.nationalNews.data[0].title = "RSS latest headline";
  w.fetch = async (url, options) => {
    const news = String(url).startsWith("/api/news");
    if (news) newsRequests.push(options?.method || "GET");
    return {
      ok: true,
      json: async () => structuredClone(news ? liveDaily : sportsPayload),
      headers: new Map(),
    };
  };
  w.URL.createObjectURL = () => "blob:test";
  w.URL.revokeObjectURL = () => {};
  const clickAnchor = w.HTMLAnchorElement.prototype.click;
  w.HTMLAnchorElement.prototype.click = function () {
    if (!this.download) clickAnchor.call(this);
  };
  const globals = {
    window: w,
    document: w.document,
    navigator: w.navigator,
    CustomEvent: w.CustomEvent,
    Event: w.Event,
    localStorage: w.localStorage,
    matchMedia: w.matchMedia,
    Blob: w.Blob,
    URL: w.URL,
    IS_REACT_ACT_ENVIRONMENT: true,
  };
  const descriptors = new Map(
    Object.keys(globals).map((key) => [
      key,
      Object.getOwnPropertyDescriptor(globalThis, key),
    ]),
  );
  for (const [key, value] of Object.entries(globals))
    Object.defineProperty(globalThis, key, {
      value,
      configurable: true,
      writable: true,
    });
  const active = [
    "news",
    "stats",
    "sports",
    "results",
    "links",
    "schedule",
    "countdown",
    "upcoming",
  ];
  w.localStorage.setItem(
    "hibi-sports-workspace-v2",
    JSON.stringify({
      version: 2,
      displayName: "既存ユーザー",
      sections: [...active, "train", "focus", "saved", "notes"].map((id) => ({
        id,
        visible: true,
        column: ["news", "train", "stats"].includes(id)
          ? "top"
          : ["schedule", "countdown", "upcoming"].includes(id)
            ? "side"
            : "main",
      })),
      hiddenMenus: ["notes"],
      notes: [],
      focus: [],
      session: {},
      links: [
        {
          id: "existing",
          title: "既存リンク",
          url: "https://example.com",
          category: "野球",
          favorite: true,
        },
      ],
    }),
  );
  const { hydrateRoot } = await import("react-dom/client");
  let root;
  const $ = (id) => w.document.getElementById(id);
  const event = (id, type) =>
    $(id).dispatchEvent(new w.Event(type, { bubbles: true, cancelable: true }));
  const change = (node, value) => {
    node.value = value;
    node.dispatchEvent(new w.Event("change", { bubbles: true }));
  };
  try {
    await act(async () => {
      root = hydrateRoot($("root"), element, {
        onRecoverableError: (error) => errors.push(error.message),
      });
      await new Promise((resolve) => setTimeout(resolve, 100));
    });
    assert.deepEqual(errors, []);
    assert.equal($("settings").hidden, false);
    assert.ok($("workspace-links-items").textContent.includes("既存リンク"));
    assert.ok($("carousel-content").querySelector("a"));
    assert.ok(
      $("carousel-content").textContent.includes("RSS latest headline"),
    );
    assert.ok($("carousel-updated").textContent.includes("17:40"));
    $("carousel-refresh").click();
    await new Promise((resolve) => setTimeout(resolve, 0));
    assert.equal(newsRequests.at(-1), "POST");
    $("refresh").click();
    await new Promise((resolve) => setTimeout(resolve, 0));
    assert.ok(
      $("carousel-content").textContent.includes("RSS latest headline"),
      "sports refresh keeps newer news",
    );
    const checkedBeforeFocus = newsRequests.length;
    w.dispatchEvent(new w.Event("focus"));
    await new Promise((resolve) => setTimeout(resolve, 0));
    assert.equal(newsRequests.length, checkedBeforeFocus + 1);
    assert.ok($("football-game").textContent.includes("19:15"));
    assert.ok($("workspace-countdown").textContent.includes("19:15"));
    assert.ok($("kickoff-countdown").textContent.includes("19:15"));
    const brazilGame = sportsPayload.footballGames.data.find(
      (game) => game.date === "2026-11-14",
    );
    brazilGame.time = "";
    $("refresh").click();
    await new Promise((resolve) => setTimeout(resolve, 0));
    assert.ok($("workspace-countdown").textContent.includes("未発表"));
    assert.equal($("workspace-countdown").querySelector(".timer-digits"), null);
    assert.ok($("kickoff-countdown").textContent.includes("未発表"));
    brazilGame.time = "19:15";
    $("refresh").click();
    await new Promise((resolve) => setTimeout(resolve, 0));
    assert.ok($("workspace-countdown").textContent.includes("19:15"));

    assert.equal($("home-widget-sports").closest("#home")?.id, "home");
    assert.equal(
      $("news").querySelector("#today-games, #tomorrow-games"),
      null,
    );
    assert.equal($("workspace-sport-cards"), null);
    assert.equal($("workspace-today-list"), null);
    assert.equal($("football-timeline"), null);
    assert.equal($("overseas-games"), null);
    assert.equal($("squad-list").closest("details"), null);
    assert.equal(
      $("squad-list").querySelectorAll(".squad-player").length,
      snapshot.footballSquad.data.players.length,
    );
    assert.ok($("squad-list").querySelector(".squad-position h4"));
    assert.equal(
      $("squad-changes").querySelectorAll(".squad-change-card").length,
      2,
    );

    assert.equal(w.document.querySelectorAll("[data-theme-choice]").length, 12);
    assert.equal(
      w.document.querySelector(
        '[data-news-save],[data-create="note"],[data-create="focus"]',
      ),
      null,
    );
    w.document
      .querySelector('[data-settings-target="settings-sports"]')
      .click();
    assert.equal($("settings-sports").open, true);
    w.document.querySelector('[data-theme-choice="mint"]').click();
    assert.equal(w.document.documentElement.dataset.theme, "mint");
    change($("appearance-mode"), "dark");
    assert.equal(w.document.documentElement.dataset.dark, "true");
    assert.equal(
      w.document.documentElement.style.getPropertyValue("--surface"),
      "",
    );
    change($("appearance-mode"), "light");
    const toggle = w.document.querySelector('[data-layout-visible="results"]');
    toggle.checked = false;
    toggle.dispatchEvent(new w.Event("change", { bubbles: true }));
    assert.equal(
      w.document.querySelector('[data-workspace-section="results"]').hidden,
      false,
    );
    event("workspace-layout-form", "submit");
    assert.equal(
      w.document.querySelector('[data-workspace-section="results"]').hidden,
      true,
    );
    const linkColumn = w.document.querySelector('[data-layout-column="links"]');
    change(linkColumn, "side");
    event("workspace-layout-form", "submit");
    assert.ok(
      $("workspace-secondary").querySelector(
        '[data-workspace-section="links"]',
      ),
    );
    $("workspace-display-name").value = "変更後";
    event("workspace-profile-form", "submit");
    for (const section of [
      "home",
      "news",
      "baseball",
      "football",
      "draft",
      "schedule",
      "links",
    ]) {
      $("tab-" + section).click();
      assert.equal($(section).hidden, false, section);
      assert.equal(
        w.location.pathname,
        section === "home" ? "/" : "/" + section,
      );
    }
    const categoryButton = w.document.querySelector(
      '[data-news-category="world"]',
    );
    categoryButton.click();
    assert.equal(categoryButton.getAttribute("aria-pressed"), "true");
    assert.equal($("news-category-heading").textContent, "国際ニュース");
    assert.equal(
      w.document.querySelectorAll('[data-news-category][aria-pressed="true"]')
        .length,
      1,
    );
    assert.ok($("national-news").querySelector(".news-headline"));
    assert.ok($("national-news").querySelector("time[datetime]"));
    w.document.querySelector('[data-news-view="local"]').click();
    assert.equal($("local-news-section").hidden, false);
    assert.equal($("national-news-section").hidden, true);
    assert.ok($("local-news-section").contains($("home-region")));
    w.document.querySelector('[data-news-view="national"]').click();
    assert.equal($("national-news-section").hidden, false);
    Object.defineProperty(w, "innerWidth", {
      configurable: true,
      writable: true,
      value: 390,
    });
    $("menu-toggle").click();
    assert.equal($("menu-toggle").getAttribute("aria-expanded"), "true");
    assert.equal($("workspace-sidebar-overlay").hidden, false);
    assert.equal(
      w.document.body.classList.contains("workspace-menu-open"),
      true,
    );
    $("workspace-sidebar-overlay").click();
    assert.equal(
      w.document.body.classList.contains("workspace-menu-open"),
      false,
    );
    $("menu-toggle").click();
    w.document.dispatchEvent(
      new w.KeyboardEvent("keydown", { key: "Escape", bubbles: true }),
    );
    assert.equal($("menu-toggle").getAttribute("aria-expanded"), "false");
    assert.equal(w.document.activeElement, $("menu-toggle"));
    $("menu-toggle").click();
    $("tab-news").click();
    assert.equal(
      w.document.body.classList.contains("workspace-menu-open"),
      false,
    );
    assert.equal($("workspace-sidebar-overlay").hidden, true);
    $("menu-toggle").click();
    w.innerWidth = 1024;
    w.dispatchEvent(new w.Event("resize"));
    assert.equal($("site-menu").classList.contains("mobile-open"), false);
    assert.equal(
      w.document.body.classList.contains("workspace-menu-open"),
      false,
    );
    w.document.querySelector('[data-create="link"]').click();
    $("workspace-editor-name").value = "追加リンク";
    $("workspace-editor-url").value = "https://example.org";
    event("workspace-editor-form", "submit");
    const saved = JSON.parse(
      w.localStorage.getItem("hibi-sports-workspace-v2"),
    );
    assert.equal(
      saved.links.filter((item) => item.title === "追加リンク").length,
      1,
      "Strict Mode registers one submit handler",
    );
    assert.equal(saved.sections.length, 7);
    assert.equal("session" in saved, false);
    assert.equal($("open-search"), null);
    assert.equal($("open-quick"), null);
    assert.equal($("workspace-search"), null);
    assert.equal($("workspace-quick"), null);
    assert.equal($("menu-toggle").closest("header")?.className, "topbar");
    w.document.dispatchEvent(
      new w.KeyboardEvent("keydown", {
        key: "k",
        ctrlKey: true,
        bubbles: true,
      }),
    );
    assert.equal(w.document.querySelector("dialog[open]"), null);
    const before = $("carousel-content").textContent;
    $("carousel-next").click();
    assert.notEqual($("carousel-content").textContent, before);
    let exported;
    w.URL.createObjectURL = (blob) => {
      exported = blob;
      return "blob:export";
    };
    $("workspace-backup-save").click();
    assert.ok(exported instanceof w.Blob);
    const json = JSON.parse(
      await new Promise((resolve, reject) => {
        const reader = new w.FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsText(exported);
      }),
    );
    assert.equal(json.format, "hibi-sports-complete");
    assert.ok(json.sports.drafts);
    assert.equal(json.workspace.displayName, "変更後");
    json.workspace.displayName = "復元ユーザー";
    Object.defineProperty($("workspace-backup-file"), "files", {
      configurable: true,
      value: [{ size: 100, text: async () => JSON.stringify(json) }],
    });
    event("workspace-backup-file", "change");
    await new Promise((resolve) => setTimeout(resolve, 0));
    assert.equal($("workspace-backup-preview").hidden, false);
    assert.equal(
      JSON.parse(w.localStorage.getItem("hibi-sports-workspace-v2"))
        .displayName,
      "変更後",
    );
    $("workspace-backup-apply").click();
    assert.equal(
      JSON.parse(w.localStorage.getItem("hibi-sports-workspace-v2"))
        .displayName,
      "復元ユーザー",
    );
    assert.deepEqual(errors, []);
    // All global document handlers are removed after React unmounts.
    $("menu-toggle").click();
    await act(async () => root.unmount());
    assert.equal(
      w.document.body.classList.contains("workspace-menu-open"),
      false,
    );
    root = undefined;
    w.document.dispatchEvent(
      new w.KeyboardEvent("keydown", {
        key: "k",
        ctrlKey: true,
        bubbles: true,
      }),
    );
    await new Promise((resolve) => setTimeout(resolve, 0));
    assert.deepEqual(errors, []);
  } finally {
    if (root) await act(async () => root.unmount());
    w.close();
    for (const [key, descriptor] of descriptors) {
      if (descriptor) Object.defineProperty(globalThis, key, descriptor);
      else Reflect.deleteProperty(globalThis, key);
    }
  }
});
