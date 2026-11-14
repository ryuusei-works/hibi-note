import type React from "react";
import type { Section } from "@/types/ui";
import { sectionLabels, sectionDescriptions } from "@/utils/navigation";
import { Home } from "./Home";
import { News } from "./News";
import { Schedule } from "./Schedule";
import { LinkCards } from "./LinkCards";
import { Draft } from "./Draft";
import { Settings } from "./Settings";
import { Baseball } from "./Baseball";
import { Football } from "./Football";
import { Guide } from "./Guide";
import { Sidebar } from "./Sidebar";
import { SportsDialogs } from "./SportsDialogs";
import { WorkspaceDialogs } from "./WorkspaceDialogs";
export function DashboardView({ section }: { section: Section }) {
  return (
    <>
      <a className="skip-link" href="#main-content">
        {"本文へ移動"}
      </a>
      <div className="app-shell">
        <Sidebar />
        <div className="main-shell">
          <header className="topbar">
            <button
              id="menu-toggle"
              className="mobile-menu"
              aria-controls="site-menu"
              aria-expanded="false"
              aria-label="メニューを開く"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                aria-hidden="true"
              >
                <path d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <div className="breadcrumb">
              <span className="breadcrumb-root">{"ワークスペース"}</span>
              <span>{"/"}</span>
              <strong id="breadcrumb-current">{sectionLabels[section]}</strong>
            </div>
            <div className="topbar-actions">
              <a
                className="top-avatar"
                href="/settings"
                data-open-tab="settings"
                aria-label="プロフィール設定"
                data-profile-avatar=""
              >
                {"自"}
              </a>
            </div>
          </header>
          <main id="main-content" tabIndex={-1} className="main-content">
            <div className="page-heading home-heading">
              <div>
                <div className="eyebrow" id="workspace-date"></div>
                <h1 id="page-title">{sectionLabels[section]}</h1>
                <p id="page-description">{sectionDescriptions[section]}</p>
              </div>
            </div>
            <details
              className="workspace-data-status"
              hidden={section !== "home"}
            >
              <summary>{"更新・保存・データの出典"}</summary>
              <div
                className="home-backup-status workspace-sync"
                hidden={section !== "home"}
              >
                <span id="workspace-saved-note">
                  {"設定・リンクはこのブラウザに保存"}
                </span>
                <div className="workspace-sync-actions">
                  <button id="refresh" className="text-button">
                    {"↻ 最新情報に更新"}
                  </button>
                  <a id="data-update-link" hidden></a>
                  <small hidden></small>
                  <button className="button" id="workspace-export">
                    {"↓ JSONを保存"}
                  </button>
                </div>
              </div>

              <div id="status" className="status" role="status">
                {"公開データを読み込んでいます…"}
              </div>
              <p id="data-updated" className="data-updated" role="status">
                {"データ取得日時：確認中"}
              </p>
            </details>
            <Home section={section} />
            <News section={section} />
            <Schedule section={section} />
            <LinkCards section={section} />
            <Draft section={section} />
            <Settings section={section} />
            <Baseball section={section} />
            <Football section={section} />
            <Guide section={section} />
          </main>
          <footer className="page-footer">
            {"情報を整えて、観戦をもっと楽しく。"}
            <span>{"Hibi Sports · ニュースとスポーツのワークスペース"}</span>
          </footer>
        </div>
      </div>
      <SportsDialogs />
      <WorkspaceDialogs />
    </>
  );
}
