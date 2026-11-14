import { formatDate } from "../utils/dates.js";
import { matchCountdown } from "../utils/matches.js";

/** Workspace preferences, layout, links and backup interactions.
 * @param {ReturnType<import('./sports').mountSports>} sports
 * @param {import('./lifecycle').DashboardLifecycle} scope
 */
export function mountWorkspace(sports, scope) {
  const $ = (id) => document.getElementById(id);
  const icon = (name, size = 16) =>
    `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.65" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${{ plus: '<path d="M12 5v14M5 12h14"/>', arrow: '<path d="M7 17 17 7M7 7h10v10"/>', clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>', ball: '<circle cx="12" cy="12" r="9"/><path d="M5 6c6 2 6 10 0 12M19 6c-6 2-6 10 0 12"/>', note: '<path d="M14 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V10Z"/><path d="M14 3v7h7M7 14h10m-10 3h7"/>', star: '<path d="m12 3 3 6 7 1-5 5 1 7-6-3-6 3 1-7-5-5 7-1Z"/>', search: '<circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5"/>', chevron: '<path d="m9 5 7 7-7 7"/>' }[name] || '<path d="M5 12h14"/>'}</svg>`;
  const sectionLabels = {
    news: "ニュース",
    stats: "件数のまとめ",
    matches: "今日・明日の試合",
    results: "最近の試合結果",
    links: "クイックリンク",
    countdown: "次の代表戦",
    upcoming: "これからの試合",
  };
  const defaultSections = () =>
    Object.keys(sectionLabels).map((id) => ({
      id,
      visible: true,
      column: ["news", "matches", "stats"].includes(id)
        ? "top"
        : ["countdown", "upcoming"].includes(id)
          ? "side"
          : "main",
    }));
  const defaultLinks = () => [
    {
      id: "npb",
      title: "NPB公式",
      url: "https://npb.jp/",
      category: "野球",
      favorite: true,
    },
    {
      id: "jfa",
      title: "JFA公式",
      url: "https://www.jfa.jp/samuraiblue/",
      category: "日本代表",
      favorite: true,
    },
    {
      id: "fifa",
      title: "FIFAランキング",
      url: "https://inside.fifa.com/fifa-rankings/men",
      category: "日本代表",
      favorite: true,
    },
    {
      id: "news",
      title: "スポーツニュース",
      url: "https://sports.yahoo.co.jp/",
      category: "ニュース",
      favorite: true,
    },
  ];
  const key = "hibi-sports-workspace-v2";
  function initial() {
    return {
      version: 2,
      displayName: "",
      sections: defaultSections(),
      hiddenMenus: [],
      links: defaultLinks(),
    };
  }
  function validate(value) {
    if (
      !value ||
      value.version !== 2 ||
      typeof value.displayName !== "string" ||
      value.displayName.length > 40
    )
      throw Error("ワークスペースの形式が正しくありません。");
    const retired = ["train", "focus", "saved", "notes", "sports", "schedule"];
    if (Array.isArray(value.sections)) {
      const legacy = value.sections.some((row) =>
        ["sports", "schedule"].includes(row.id),
      );
      value.sections = value.sections.filter(
        (row) => !retired.includes(row.id),
      );
      if (legacy && !value.sections.some((row) => row.id === "matches"))
        value.sections.splice(1, 0, {
          id: "matches",
          visible: true,
          column: "top",
        });
    }
    if (
      !Array.isArray(value.sections) ||
      value.sections.length !== Object.keys(sectionLabels).length ||
      new Set(value.sections.map((s) => s.id)).size !== value.sections.length ||
      value.sections.some(
        (s) =>
          !Object.hasOwn(sectionLabels, s.id) ||
          !["top", "main", "side"].includes(s.column) ||
          typeof s.visible !== "boolean",
      )
    )
      throw Error("ホームの表示設定が正しくありません。");
    if (
      !Array.isArray(value.hiddenMenus) ||
      value.hiddenMenus.some(
        (id) =>
          ![
            "news",
            "baseball",
            "football",
            "draft",
            "schedule",
            "links",
            "notes",
          ].includes(id),
      )
    )
      throw Error("メニュー設定が正しくありません。");
    value.hiddenMenus = value.hiddenMenus.filter((id) => id !== "notes");
    for (const name of [
      "focus",
      "notes",
      "session",
      "journeyDestination",
      "journeyModel",
    ])
      delete value[name];
    for (const collection of ["links"]) {
      if (
        !Array.isArray(value[collection]) ||
        value[collection].length > 500 ||
        new Set(value[collection].map((x) => x.id)).size !==
          value[collection].length
      )
        throw Error("保存内容が正しくありません。");
      for (const row of value[collection]) {
        if (
          typeof row.id !== "string" ||
          typeof row.title !== "string" ||
          !row.title.trim() ||
          row.title.length > 200
        )
          throw Error("タイトルを確認してください。");
        if (collection === "links" && !validURL(row.url))
          throw Error("リンクはhttpsまたはhttpで指定してください。");
        if (
          collection === "notes" &&
          (typeof row.body !== "string" || row.body.length > 10000)
        )
          throw Error("メモの形式を確認してください。");
        if (
          collection === "focus" &&
          (!/^\d{4}-\d{2}-\d{2}$/.test(row.date) ||
            typeof row.done !== "boolean")
        )
          throw Error("チェックの形式が正しくありません。");
      }
    }
    return value;
  }
  function validURL(url) {
    try {
      return ["https:", "http:"].includes(new URL(url).protocol);
    } catch {
      return false;
    }
  }
  let state = initial();
  try {
    const saved = localStorage.getItem(key);
    if (saved) state = validate(JSON.parse(saved));
  } catch {}
  let timer;
  function notify(message) {
    $("workspace-toast").textContent = message;
    $("workspace-toast").hidden = false;
    scope.clearTimeout(timer);
    timer = scope.setTimeout(() => ($("workspace-toast").hidden = true), 4500);
  }
  function persist() {
    try {
      localStorage.setItem(key, JSON.stringify(state));
      return true;
    } catch {
      notify("ブラウザに保存できませんでした。保存容量を確認してください。");
      return false;
    }
  }
  function dialogOpen(id) {
    document.querySelectorAll("dialog[open]").forEach((d) => d.close());
    const d = $(id);
    d.showModal();
    document.body.classList.add("workspace-modal-open");
  }
  function closeDialogs() {
    document.querySelectorAll("dialog[open]").forEach((d) => d.close());
    document.body.classList.remove("workspace-modal-open");
  }
  for (const d of document.querySelectorAll("dialog")) {
    scope.listen(d, "click", (e) => {
      if (e.target === d) closeDialogs();
    });
    scope.listen(d, "close", () => {
      if (!document.querySelector("dialog[open]"))
        document.body.classList.remove("workspace-modal-open");
    });
  }
  function mobileClose() {
    $("site-menu").classList.remove("mobile-open");
    $("workspace-sidebar-overlay").hidden = true;
    $("menu-toggle").setAttribute("aria-expanded", "false");
    $("menu-toggle").setAttribute("aria-label", "メニューを開く");
    document.body.classList.remove("workspace-menu-open");
  }
  scope.listen($("menu-toggle"), "click", () => {
    const open = $("site-menu").classList.toggle("mobile-open");
    $("workspace-sidebar-overlay").hidden = !open;
    $("menu-toggle").setAttribute("aria-expanded", String(open));
    $("menu-toggle").setAttribute(
      "aria-label",
      open ? "メニューを閉じる" : "メニューを開く",
    );
    document.body.classList.toggle("workspace-menu-open", open);
  });
  scope.listen($("workspace-sidebar-overlay"), "click", mobileClose);
  scope.listen(document, "keydown", (event) => {
    if (
      event.key === "Escape" &&
      $("site-menu").classList.contains("mobile-open")
    ) {
      mobileClose();
      $("menu-toggle").focus();
    }
  });
  scope.listen(window, "resize", () => {
    if (window.innerWidth > 760) mobileClose();
  });
  scope.listen(document, "click", (e) => {
    const route = e.target.closest("[data-open-tab]");
    if (route) {
      e.preventDefault();
      closeDialogs();
      mobileClose();
      sports.navigatePanel(route.dataset.openTab);
      return;
    }
    if (e.target.closest(".site-tabs [data-tab]")) mobileClose();
    if (e.target.closest("[data-close-dialog]")) {
      e.preventDefault();
      closeDialogs();
    }
    const create = e.target.closest("[data-create]");
    if (create) {
      openEditor(create.dataset.create);
      return;
    }
    const edit = e.target.closest("[data-edit-kind]");
    if (edit) {
      openEditor(edit.dataset.editKind, edit.dataset.itemId);
      return;
    }
    const del = e.target.closest("[data-remove-kind]");
    if (del) {
      const collection = del.dataset.removeKind === "note" ? "notes" : "links";
      const item = state[collection].find((i) => i.id === del.dataset.itemId);
      if (!item) return;
      const index = state[collection].indexOf(item);
      state[collection].splice(index, 1);
      persist();
      renderCollections();
      renderHomeUtilities();
      notify("削除しました");
      const undo = document.createElement("button");
      undo.className = "undo-button";
      undo.textContent = "元に戻す";
      scope.listen(undo, "click", () => {
        state[collection].splice(index, 0, item);
        persist();
        renderCollections();
        renderHomeUtilities();
        notify("元に戻しました");
      });
      $("workspace-toast").append(undo);
    }
  });
  function renderProfile() {
    document
      .querySelectorAll("[data-profile-name]")
      .forEach(
        (el) => (el.textContent = state.displayName || "マイワークスペース"),
      );
    document
      .querySelectorAll("[data-profile-avatar]")
      .forEach(
        (el) => (el.textContent = Array.from(state.displayName)[0] || "自"),
      );
    $("workspace-display-name").value = state.displayName;
    const now = new Date(),
      hour = Number(
        new Intl.DateTimeFormat("en-GB", {
          timeZone: "Asia/Tokyo",
          hour: "numeric",
          hourCycle: "h23",
        }).format(now),
      );
    $("workspace-date").innerHTML =
      icon("clock", 15) +
      " " +
      new Intl.DateTimeFormat("ja-JP", {
        timeZone: "Asia/Tokyo",
        year: "numeric",
        month: "long",
        day: "numeric",
        weekday: "long",
      }).format(now);
    if (document.documentElement.dataset.page === "home") {
      $("page-title").innerHTML =
        `${hour < 11 ? "おはようございます" : hour < 17 ? "こんにちは" : "お疲れさまです"}${state.displayName ? "、" + sports.esc(state.displayName) + "さん" : ""}<span class="greeting-dot">.</span>`;
      $("page-description").textContent = "ニュースと今日の試合を、ひと目で。";
    }
    document.querySelector(".workspace-sync").hidden =
      document.documentElement.dataset.page !== "home";
    document.querySelector(".workspace-data-status").hidden =
      document.documentElement.dataset.page !== "home";
  }
  scope.listen($("workspace-profile-form"), "submit", (e) => {
    e.preventDefault();
    state.displayName = $("workspace-display-name").value.trim().slice(0, 40);
    if (persist()) {
      renderProfile();
      notify("プロフィールを保存しました");
    }
  });
  function renderLayout() {
    const parents = {
      top: $("home-top-sections"),
      main: $("workspace-primary"),
      side: $("workspace-secondary"),
    };
    const nodes = new Map(
      [...document.querySelectorAll("[data-workspace-section]")].map((el) => [
        el.dataset.workspaceSection,
        el,
      ]),
    );
    for (const row of state.sections) {
      const node = nodes.get(row.id);
      node.classList.add("home-section", "home-section-" + row.id);
      node.hidden = !row.visible;
      parents[row.column].append(node);
    }
    const columns = $("home").querySelector(".home-columns");
    columns.classList.toggle(
      "home-main-only",
      !state.sections.some((s) => s.visible && s.column === "side"),
    );
    columns.classList.toggle(
      "home-side-only",
      !state.sections.some((s) => s.visible && s.column === "main"),
    );
    parents.main.hidden = !state.sections.some(
      (s) => s.visible && s.column === "main",
    );
    parents.side.hidden = !state.sections.some(
      (s) => s.visible && s.column === "side",
    );
  }
  let layoutDraft = structuredClone(state.sections),
    menuDraft = [...state.hiddenMenus];
  const columns = [
    ["top", "上部（全幅）"],
    ["main", "メイン列"],
    ["side", "右列"],
  ];
  function renderLayoutSettings() {
    $("workspace-layout-settings").innerHTML = columns
      .map(([column, label]) => {
        const rows = layoutDraft.filter((row) => row.column === column);
        return `<fieldset class="home-layout-group"><legend>${label}</legend><ol class="home-layout-list">${rows.map((row, i) => `<li class="home-layout-row"><label class="home-layout-toggle"><input type="checkbox" data-layout-visible="${row.id}" ${row.visible ? "checked" : ""} aria-label="${sectionLabels[row.id]}を表示">${sectionLabels[row.id]}</label><div class="home-layout-actions"><select data-layout-column="${row.id}" aria-label="${sectionLabels[row.id]}の表示位置">${columns.map(([id, title]) => `<option value="${id}" ${row.column === id ? "selected" : ""}>${title}</option>`).join("")}</select><button type="button" class="button" data-layout-move="${row.id}" data-direction="-1" ${i === 0 ? "disabled" : ""} aria-label="${sectionLabels[row.id]}を上へ">↑</button><button type="button" class="button" data-layout-move="${row.id}" data-direction="1" ${i === rows.length - 1 ? "disabled" : ""} aria-label="${sectionLabels[row.id]}を下へ">↓</button></div></li>`).join("")}</ol>${rows.length ? "" : '<p class="muted">この列の項目はありません</p>'}</fieldset>`;
      })
      .join("");
  }
  scope.listen($("workspace-layout-settings"), "change", (e) => {
    const row = layoutDraft.find(
      (s) =>
        s.id ===
        (e.target.dataset.layoutVisible || e.target.dataset.layoutColumn),
    );
    if (!row) return;
    if (e.target.dataset.layoutVisible) row.visible = e.target.checked;
    else row.column = e.target.value;
    renderLayoutSettings();
  });
  scope.listen($("workspace-layout-settings"), "click", (e) => {
    const b = e.target.closest("[data-layout-move]");
    if (!b || b.disabled) return;
    const i = layoutDraft.findIndex((s) => s.id === b.dataset.layoutMove),
      rows = layoutDraft.filter((s) => s.column === layoutDraft[i].column),
      other =
        rows[
          rows.findIndex((s) => s.id === b.dataset.layoutMove) +
            Number(b.dataset.direction)
        ];
    if (!other) return;
    const j = layoutDraft.indexOf(other);
    [layoutDraft[i], layoutDraft[j]] = [layoutDraft[j], layoutDraft[i]];
    renderLayoutSettings();
  });
  scope.listen($("workspace-layout-form"), "submit", (e) => {
    e.preventDefault();
    const previous = state.sections;
    state.sections = structuredClone(layoutDraft);
    if (persist()) {
      renderLayout();
      notify("ホームの表示設定を保存しました");
    } else state.sections = previous;
  });
  scope.listen($("workspace-layout-reset"), "click", () => {
    layoutDraft = defaultSections();
    renderLayoutSettings();
  });
  function renderMenus() {
    for (const id of Object.keys(sports.panels)) {
      const tab = $("tab-" + id);
      if (tab) tab.hidden = state.hiddenMenus.includes(id);
    }
    renderMenuSettings();
  }
  function renderMenuSettings() {
    $("workspace-menu-settings").innerHTML = [
      "home",
      "news",
      "baseball",
      "football",
      "draft",
      "schedule",
      "links",
      "settings",
    ]
      .map((id) => {
        const fixed = ["home", "settings"].includes(id);
        return `<label class="menu-settings-option"><input type="checkbox" data-menu-visible="${id}" ${fixed || !menuDraft.includes(id) ? "checked" : ""} ${fixed ? "disabled" : ""} aria-label="${sports.panels[id].label}をメニューに表示">${icon(id === "links" ? "arrow" : "ball", 17)}<span>${sports.panels[id].label}</span>${fixed ? "<small>常に表示</small>" : ""}</label>`;
      })
      .join("");
  }
  scope.listen($("workspace-menu-settings"), "change", (e) => {
    const id = e.target.dataset.menuVisible;
    if (!id) return;
    menuDraft = menuDraft.filter((v) => v !== id);
    if (!e.target.checked) menuDraft.push(id);
  });
  scope.listen($("workspace-menu-form"), "submit", (e) => {
    e.preventDefault();
    const previous = state.hiddenMenus;
    state.hiddenMenus = [...menuDraft];
    if (persist()) {
      renderMenus();
      notify("メニューの表示設定を保存しました");
    } else state.hiddenMenus = previous;
  });
  scope.listen($("workspace-menu-reset"), "click", () => {
    menuDraft = [];
    renderMenuSettings();
  });
  function openEditor(kind, id = "") {
    if (kind !== "link") return;
    const item = state.links.find((i) => i.id === id);
    $("workspace-editor-kind").value = "link";
    $("workspace-editor-id").value = id;
    $("workspace-editor-title").textContent =
      "リンク" + (item ? "を編集" : "を追加");
    $("workspace-editor-name").value = item?.title || "";
    $("workspace-editor-url").value = item?.url || "";
    $("workspace-editor-category").value = item?.category || "";
    $("workspace-editor-favorite").checked = item?.favorite ?? true;
    $("workspace-editor-url").required = true;
    $("workspace-editor-error").textContent = "";
    dialogOpen("workspace-editor");
    $("workspace-editor-name").focus();
  }
  scope.listen($("workspace-editor-form"), "submit", (e) => {
    e.preventDefault();
    const id = $("workspace-editor-id").value || crypto.randomUUID(),
      title = $("workspace-editor-name").value.trim(),
      url = $("workspace-editor-url").value.trim();
    if (!title) return;
    if (!validURL(url)) {
      $("workspace-editor-error").textContent =
        "URLは https:// または http:// で指定してください。";
      return;
    }
    const item = {
        id,
        title,
        url,
        category: $("workspace-editor-category").value.trim(),
        favorite: $("workspace-editor-favorite").checked,
        updatedAt: new Date().toISOString(),
      },
      index = state.links.findIndex((i) => i.id === id);
    if (index >= 0) state.links[index] = item;
    else state.links.unshift(item);
    if (persist()) {
      closeDialogs();
      renderCollections();
      renderHomeUtilities();
      notify("保存しました");
    }
  });
  const empty = (message) =>
    `<div class="empty">${icon("note", 26)}<p>${message}</p></div>`;
  function renderCollections() {
    for (const [collection, kind] of [["links", "link"]]) {
      const query = $("workspace-" + collection + "-search")
          .value.trim()
          .toLowerCase(),
        rows = state[collection].filter((i) =>
          (i.title + " " + (i.body || i.url) + " " + i.category)
            .toLowerCase()
            .includes(query),
        );
      $("workspace-" + collection + "-items").innerHTML = rows.length
        ? rows
            .map(
              (i) =>
                `<article class="workspace-item panel"><div class="workspace-item-heading"><span class="${kind === "note" ? "small-icon" : "link-avatar large"}">${kind === "note" ? icon("note", 20) : sports.esc(i.title[0])}</span><div class="workspace-item-actions"><button class="icon-button" data-edit-kind="${kind}" data-item-id="${sports.esc(i.id)}" aria-label="${sports.esc(i.title)}を編集">編集</button><button class="icon-button" data-remove-kind="${kind}" data-item-id="${sports.esc(i.id)}" aria-label="${sports.esc(i.title)}を削除">×</button></div></div><h3>${kind === "link" ? `<a href="${sports.esc(i.url)}" target="_blank" rel="noopener noreferrer">${sports.esc(i.title)} ↗</a>` : `<button class="text-button" data-edit-kind="note" data-item-id="${sports.esc(i.id)}">${sports.esc(i.title)}</button>`}</h3><small class="muted">${sports.esc(i.category || "未分類")}${i.favorite ? " · ★" : ""}</small><p>${sports.esc(kind === "note" ? i.body : i.url)}</p></article>`,
            )
            .join("")
        : empty(
            query
              ? "一致するデータがありません"
              : kind === "note"
                ? "まだメモがありません。観戦の記録を残してみましょう。"
                : "まだリンクがありません。よく使う情報源を追加しましょう。",
          );
    }
  }
  for (const id of ["links"]) {
    scope.listen($("workspace-" + id + "-search"), "input", renderCollections);
    $(id)
      .querySelectorAll("[data-collection-view]")
      .forEach((b) =>
        scope.listen(b, "click", () => {
          $(id)
            .querySelectorAll("[data-collection-view]")
            .forEach((el) => el.classList.toggle("active", el === b));
          $("workspace-" + id + "-items").classList.toggle(
            "workspace-list-view",
            b.dataset.collectionView === "list",
          );
        }),
      );
  }
  function renderHomeUtilities() {
    $("workspace-home-links").innerHTML =
      state.links
        .filter((l) => l.favorite)
        .slice(0, 4)
        .map(
          (l) =>
            `<a href="${sports.esc(l.url)}" target="_blank" rel="noopener noreferrer"><span class="link-avatar">${sports.esc(l.title[0])}</span>${sports.esc(l.title)}${icon("arrow", 12)}</a>`,
        )
        .join("") || empty("お気に入りのリンクはありません");
  }
  function download() {
    const backup = {
      format: "hibi-sports-complete",
      version: 1,
      exportedAt: new Date().toISOString(),
      workspace: state,
      sports: sports.collectBackup(),
    };
    const blob = new Blob([JSON.stringify(backup, null, 2)], {
        type: "application/json",
      }),
      url = URL.createObjectURL(blob),
      a = document.createElement("a");
    a.href = url;
    a.download = "hibi-sports-backup-" + sports.currentDay() + ".json";
    a.click();
    scope.setTimeout(() => URL.revokeObjectURL(url), 1000);
    notify("データを保存しました");
  }
  scope.listen($("workspace-export"), "click", download);
  scope.listen($("workspace-backup-save"), "click", download);
  let pendingWorkspaceBackup = null;
  function cancelWorkspaceBackup() {
    pendingWorkspaceBackup = null;
    $("workspace-backup-preview").hidden = true;
  }
  scope.listen($("workspace-backup-cancel"), "click", cancelWorkspaceBackup);
  scope.listen($("workspace-backup-file"), "change", async (e) => {
    const file = e.target.files[0];
    cancelWorkspaceBackup();
    if (!file) return;
    try {
      if (file.size > 2 * 1024 * 1024)
        throw Error("ファイルは2MB以下にしてください。");
      const value = JSON.parse(await file.text());
      let next;
      if (value.format === "hibi-sports-complete" && value.version === 1)
        next = {
          workspace: validate(value.workspace),
          sports: sports.validateBackup(value.sports),
        };
      else if (value.version === 2 && !value.format)
        next = { workspace: validate(value) };
      else next = { sports: sports.validateBackup(value) };
      pendingWorkspaceBackup = next;
      $("workspace-backup-preview-text").textContent =
        "ファイルに含まれる" +
        (next.workspace ? "プロフィール・ホーム配置・メニュー・リンク" : "") +
        (next.workspace && next.sports ? "と" : "") +
        (next.sports ? "スポーツの指名・表示設定" : "") +
        "を上書きします。内容を反映しますか？";
      $("workspace-backup-preview").hidden = false;
      $("workspace-backup-status").textContent =
        "内容を確認して「この内容を読み込む」を押してください。まだ反映していません。";
    } catch (error) {
      $("workspace-backup-status").textContent =
        "読み込めませんでした。" + error.message;
    } finally {
      e.target.value = "";
    }
  });
  scope.listen($("workspace-backup-apply"), "click", () => {
    if (!pendingWorkspaceBackup) return;
    const next = pendingWorkspaceBackup,
      previous = state,
      previousRaw = localStorage.getItem(key);
    try {
      if (next.workspace) {
        state = next.workspace;
        if (!persist()) throw Error("保存できませんでした。");
      }
      if (next.sports) sports.applyBackup(next.sports);
      cancelWorkspaceBackup();
      layoutDraft = structuredClone(state.sections);
      menuDraft = [...state.hiddenMenus];
      renderProfile();
      renderLayout();
      renderLayoutSettings();
      renderMenus();
      renderCollections();
      renderHomeUtilities();
      renderStorage();
      $("workspace-backup-status").textContent =
        "バックアップを読み込みました。";
      notify("バックアップを読み込みました");
    } catch (error) {
      state = previous;
      try {
        if (previousRaw === null) localStorage.removeItem(key);
        else localStorage.setItem(key, previousRaw);
      } catch {}
      $("workspace-backup-status").textContent =
        "読み込みに失敗しました。" + error.message;
    }
  });
  function renderStorage() {
    try {
      const keys = Object.keys(localStorage).filter((k) =>
        /^(hibi-|sports-desk-|daily-desk-)/.test(k),
      );
      const bytes = keys.reduce(
        (total, k) => total + 2 * (k.length + localStorage.getItem(k).length),
        0,
      );
      $("workspace-storage-usage").textContent =
        (bytes / 1024).toLocaleString("ja-JP", { maximumFractionDigits: 1 }) +
        " KB 使用中";
      $("workspace-data-summary").textContent =
        state.links.length +
        " リンク · プロフィール・表示設定・野球の指名データ";
    } catch {
      $("workspace-storage-usage").textContent =
        "保存容量を取得できませんでした。";
    }
  }
  document.querySelectorAll("[data-settings-target]").forEach((a) =>
    scope.listen(a, "click", (e) => {
      e.preventDefault();
      const target = $(a.dataset.settingsTarget);
      if (target.tagName === "DETAILS") target.open = true;
      target.scrollIntoView?.({ block: "start", behavior: "instant" });
      target.focus?.({ preventScroll: true });
    }),
  );
  let newsIndex = 0,
    newsPaused = false,
    newsHover = false;
  let newsItems = [];
  function collectNews() {
    const groups = [
      sports.data?.daily?.nationalNews,
      ...["domestic", "world", "economy"].map(
        (key) => sports.data?.daily?.newsCategories?.[key],
      ),
    ];
    const seen = new Set();
    const feeds = groups.map((source) =>
      source?.ok
        ? (Array.isArray(source.data)
            ? source.data
            : source.data.items || []
          ).map((item) => ({
            ...item,
            publisher: source.publisher || "Yahoo!\u30cb\u30e5\u30fc\u30b9",
          }))
        : [],
    );
    newsItems = [];
    const add = (item) => {
      if (
        newsItems.length < 20 &&
        item.date === sports.currentDay() &&
        validURL(item.url) &&
        !seen.has(item.url)
      ) {
        seen.add(item.url);
        newsItems.push(item);
      }
    };
    feeds[0].forEach(add);
    for (
      let index = 0;
      index < Math.max(0, ...feeds.slice(1).map((feed) => feed.length));
      index++
    ) {
      for (const feed of feeds.slice(1)) if (feed[index]) add(feed[index]);
    }
    if (newsIndex >= newsItems.length) newsIndex = 0;
  }
  const newsTime = (value) =>
    new Intl.DateTimeFormat("ja-JP", {
      timeZone: "Asia/Tokyo",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(value));
  function renderNews() {
    const item = newsItems[newsIndex];
    $("carousel-content").innerHTML = item
      ? `<article class="home-news-slide"><a href="${sports.esc(item.url)}" target="_blank" rel="noopener noreferrer"><span class="home-news-title">${sports.esc(item.title)}</span><span class="home-news-open">${icon("arrow", 18)}</span></a><div class="home-news-source"><span>${sports.esc(item.publisher)}</span><time datetime="${sports.esc(item.publishedAt || item.date)}">${sports.esc(newsTime(item.publishedAt || item.date))} 配信（日本時間）</time></div></article>`
      : empty("今日のニュースはまだ配信されていません。");
    $("carousel-index").innerHTML =
      `<strong>${String(newsItems.length ? newsIndex + 1 : 0).padStart(2, "0")}</strong><span>/</span>${String(newsItems.length).padStart(2, "0")}`;
    $("carousel-progress").style.width =
      ((newsIndex + 1) / Math.max(1, newsItems.length)) * 100 + "%";
    const source = sports.data?.daily?.nationalNews;
    $("carousel-updated").textContent = source?.fetchedAt
      ? `${source.stale ? "更新に失敗 · 前回 " : "更新 "}${newsTime(source.fetchedAt)}（日本時間）`
      : "更新を確認しています…";
    $("carousel-details").hidden = !item;
    if (item) $("carousel-details").href = item.url;
    $("carousel-prev").disabled = newsItems.length < 2;
    $("carousel-next").disabled = newsItems.length < 2;
    $("carousel-pause").disabled =
      newsItems.length < 2 ||
      matchMedia("(prefers-reduced-motion: reduce)").matches;
    const stopped =
      newsPaused ||
      newsHover ||
      matchMedia("(prefers-reduced-motion: reduce)").matches;
    $("carousel-running").dataset.running = String(!stopped);
    $("carousel-state").textContent = stopped
      ? "自動切り替え停止中"
      : "5秒ごとに切り替え";
    $("carousel-pause").innerHTML =
      `${newsPaused ? '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.65" aria-hidden="true"><path d="m8 5 11 7-11 7Z"/></svg>再開' : '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.65" aria-hidden="true"><path d="M9 5v14M15 5v14"/></svg>一時停止'}`;
    $("carousel-pause").setAttribute(
      "aria-label",
      newsPaused
        ? "ニュースの自動切り替えを再開"
        : "ニュースの自動切り替えを停止",
    );
    $("carousel-pause").setAttribute("aria-pressed", String(newsPaused));
    $("carousel-content").setAttribute("aria-live", stopped ? "polite" : "off");
  }
  scope.listen($("carousel-prev"), "click", () => {
    newsIndex =
      (newsIndex + newsItems.length - 1) % Math.max(newsItems.length, 1);
    renderNews();
  });
  scope.listen($("carousel-next"), "click", () => {
    newsIndex = (newsIndex + 1) % Math.max(newsItems.length, 1);
    renderNews();
  });
  scope.listen($("carousel-pause"), "click", () => {
    newsPaused = !newsPaused;
    renderNews();
  });
  scope.listen($("carousel-refresh"), "click", () => sports.refreshNews(true));
  for (const type of ["mouseenter", "focusin"])
    scope.listen($("workspace-news-carousel"), type, () => {
      newsHover = true;
      renderNewsState();
    });
  for (const type of ["mouseleave", "focusout"])
    scope.listen($("workspace-news-carousel"), type, (e) => {
      if (type === "focusout" && e.currentTarget.contains(e.relatedTarget))
        return;
      newsHover = false;
      renderNewsState();
    });
  function renderNewsState() {
    $("carousel-running").dataset.running = String(
      !newsPaused &&
        !newsHover &&
        !matchMedia("(prefers-reduced-motion: reduce)").matches,
    );
    $("carousel-state").textContent =
      newsPaused || newsHover ? "自動切り替え停止中" : "5秒ごとに切り替え";
  }
  scope.setInterval(() => {
    if (
      newsPaused ||
      newsHover ||
      document.hidden ||
      matchMedia("(prefers-reduced-motion: reduce)").matches ||
      newsItems.length < 2
    )
      return;
    newsIndex = (newsIndex + 1) % newsItems.length;
    renderNews();
  }, 5000);
  function renderData() {
    if (!sports.data) return;
    collectNews();
    renderNews();
    const events = sports
        .calendarEvents()
        .sort((a, b) =>
          (a.date + (a.time || "99:99")).localeCompare(
            b.date + (b.time || "99:99"),
          ),
        ),
      today = events.filter((g) => g.date === sports.currentDay()),
      future = events.filter(
        (g) => g.date >= sports.currentDay() && g.status === "scheduled",
      ),
      jp = sports.data.fifa?.ok
        ? sports.data.fifa.data.rows.find((r) => r.code === "JPN")
        : null;
    const stats = [
      ["今日の試合", today.length, "試合 · 日本時間", "clock"],
      ["プロ野球", sports.data.year, "シーズン · セ・パ両リーグ", "ball"],
      ["日本代表の世界順位", jp?.rank ?? "—", "位 · 最新公式発表", "star"],
    ];
    $("studio-stats").innerHTML = stats
      .map(
        ([label, value, note, kind]) =>
          `<div class="stat-card"><span>${label}${icon(kind)}</span><div><strong>${value}</strong><small>${note}</small></div></div>`,
      )
      .join("");
    const games = sports.completedFootball().slice(0, 3);
    $("workspace-results").innerHTML = games.length
      ? games
          .map(
            (g) =>
              `<div class="task-row"><span class="result-indicator ${g.result || ""}">${g.result === "win" ? "○" : g.result === "loss" ? "●" : "△"}</span><div class="task-main"><button data-open-tab="football">日本 <strong>${Number.isInteger(g.japanScore) ? g.japanScore + " − " + g.opponentScore : "—"}</strong> ${sports.esc(g.opponent)}</button><span>${sports.esc(g.competition || "日本代表戦")}</span></div><span class="task-deadline">${sports.esc(formatDate(g.date))}</span></div>`,
          )
          .join("")
      : empty("取得済みの試合結果はありません。");
    $("workspace-upcoming").innerHTML = future.length
      ? future
          .slice(0, 3)
          .map(
            (g) =>
              `<button class="deadline-row" data-open-tab="${g.sport === "baseball" ? "baseball" : "football"}"><div><strong>${sports.esc(sports.eventLabel(g))}</strong><small>${sports.esc(g.sport === "baseball" ? "プロ野球" : "サッカー日本代表 · " + (g.time ? g.time + " キックオフ（日本時間）" : "開始時刻未定"))}</small></div><span class="deadline-badge">${sports.esc(formatDate(g.date))}</span></button>`,
          )
          .join("")
      : empty("発表済みの試合はありません");
    updateCountdown();
    renderHomeUtilities();
  }
  function updateCountdown() {
    if (!sports.data) return;
    const next = sports.nextFootballGame();
    if (!next) {
      $("workspace-countdown").innerHTML =
        empty("次の代表戦の発表を待っています");
      return;
    }
    const countdown = matchCountdown(next);
    const { days, hours, minutes } = countdown;
    const remaining =
      countdown.status === "upcoming"
        ? `あと${days ? days + "<small>日</small> " : ""}${hours}<small>時間</small> ${minutes}<small>分</small>`
        : countdown.status === "started"
          ? "キックオフ予定時刻を過ぎました"
          : "キックオフ時刻は未発表です";
    $("workspace-countdown").innerHTML =
      `<div class="timer-label">次のキックオフ${countdown.status === "upcoming" ? "まで" : ""}</div><div class="${countdown.status === "upcoming" ? "timer-digits" : "timer-label"}">${remaining}</div><p class="countdown-opponent">日本 × ${sports.esc(next.opponent)}</p><p class="timer-label">${sports.esc(formatDate(next.date))} ${sports.esc(countdown.status === "unknown" ? "時刻未定" : next.time)} · 日本時間</p><button class="button primary timer-button" data-open-tab="football">代表戦をチェック ${icon("arrow", 12)}</button>`;
  }
  scope.setInterval(() => {
    if (!document.hidden) updateCountdown();
  }, 1000);
  scope.listen(window, "workspace:panel", () => {
    renderProfile();
    renderStorage();
    closeDialogs();
  });
  scope.listen(window, "workspace:data", renderData);
  renderProfile();
  renderLayout();
  renderLayoutSettings();
  renderMenus();
  renderCollections();
  renderHomeUtilities();
  renderData();
  renderStorage();
}
