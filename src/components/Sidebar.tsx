import type React from "react";

export function Sidebar() {
  return (
    <>
      <aside id="site-menu" className="sidebar" aria-label="サイトメニュー">
        <a className="brand" href="/" data-open-tab="home">
          <span className="brand-symbol">
            {"h"}
            <span>{"✦"}</span>
          </span>
          <div>
            {"Hibi Sports"}
            <small>{"ニュース・スポーツダッシュボード"}</small>
          </div>
        </a>
        <a
          className="workspace-switch"
          href="/settings"
          data-open-tab="settings"
        >
          <span className="workspace-avatar" data-profile-avatar="">
            {"自"}
          </span>
          <div>
            <span data-profile-name="">{"マイワークスペース"}</span>
            <small>{"自分専用のスポーツデスク"}</small>
          </div>
          <span className="workspace-switch-dots">{"⌄"}</span>
        </a>
        <span className="nav-label">{"メニュー"}</span>
        <nav className="site-tabs" aria-label="メインメニュー">
          <button
            className="nav-item "
            id="tab-home"
            data-tab="home"
            aria-controls="home"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.65"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1Z"></path>
              <path d="M9 21v-8h6v8"></path>
            </svg>
            <span>{"ホーム"}</span>
          </button>
          <button
            className="nav-item "
            id="tab-news"
            data-tab="news"
            aria-controls="news"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.65"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <rect x="3" y="4" width="18" height="16" rx="2"></rect>
              <path d="M7 8h10M7 12h6m-6 4h10"></path>
            </svg>
            <span>{"ニュース"}</span>
          </button>
          <button
            className="nav-item "
            id="tab-baseball"
            data-tab="baseball"
            aria-controls="baseball"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.65"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <circle cx="12" cy="12" r="9"></circle>
              <path d="M5 6c6 2 6 10 0 12M19 6c-6 2-6 10 0 12"></path>
            </svg>
            <span>{"プロ野球"}</span>
          </button>
          <button
            className="nav-item "
            id="tab-football"
            data-tab="football"
            aria-controls="football"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.65"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <circle cx="12" cy="12" r="9"></circle>
              <path d="m12 7 5 4-2 6H9l-2-6ZM12 7V3m5 8 4-2m-6 8 2 3m-8-3-2 3m0-9L3 9"></path>
            </svg>
            <span>{"サッカー日本代表"}</span>
          </button>
          <button
            className="nav-item "
            id="tab-draft"
            data-tab="draft"
            aria-controls="draft"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.65"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <rect x="3" y="3" width="18" height="18" rx="3"></rect>
              <path d="m7 12 3 3 7-7"></path>
            </svg>
            <span>{"野球集計"}</span>
          </button>
          <button
            className="nav-item "
            id="tab-schedule"
            data-tab="schedule"
            aria-controls="schedule"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.65"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <rect x="3" y="5" width="18" height="16" rx="2"></rect>
              <path d="M7 3v4m10-4v4M3 11h18m-14 4h3m4 0h3"></path>
            </svg>
            <span>{"スケジュール"}</span>
          </button>
          <button
            className="nav-item nav-separator"
            id="tab-links"
            data-tab="links"
            aria-controls="links"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.65"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path
                d="m10 13 4-4m-6 6-2 2a4 4 0 0 1-6-6l4-4a4 4 0 0 1 6 0m4 2 2-2a4 4 0 0 1 6 6l-4 4a4 4 0 0 1-6 0"
                transform="translate(2 0)"
              ></path>
            </svg>
            <span>{"リンク"}</span>
          </button>
        </nav>
        <div className="sidebar-bottom">
          <div className="local-status">
            <span></span>
            {"ローカルに保存"}
            <div>{"あなたのブラウザだけの空間"}</div>
          </div>
          <button
            className="nav-item"
            id="tab-settings"
            data-open-tab="settings"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.65"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="m9 3-1 3-3 1-2 3 2 2-1 3 3 3h3l2 3 3-2 3 1 3-3-1-3 2-2-2-3-3-1-1-3Z"></path>
              <circle cx="12" cy="12" r="3"></circle>
            </svg>
            {"設定"}
          </button>
          <a className="profile" href="/settings" data-open-tab="settings">
            <span className="workspace-avatar" data-profile-avatar="">
              {"自"}
            </span>
            <div>
              <span data-profile-name="">{"マイワークスペース"}</span>
              <small>{"今日も、スポーツを楽しもう。"}</small>
            </div>
            <span className="profile-dot"></span>
          </a>
        </div>
      </aside>
    </>
  );
}
