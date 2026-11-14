import type React from "react";
import type { Section } from "@/types/ui";

export function Home({ section }: { section: Section }) {
  return (
    <>
      <section id="home" aria-labelledby="tab-home" hidden={section !== "home"}>
        <div id="home-top-sections" className="home-top-sections">
          <div data-workspace-section="news">
            <section className="home-news panel">
              <div className="home-news-heading">
                <h2>
                  <span className="home-news-badge">{"NEWS"}</span>
                  <span className="home-news-heading-title">
                    {"今日の主要ニュース"}
                    <small>{"主要・国内・国際・経済"}</small>
                  </span>
                </h2>
                <div>
                  <small id="carousel-updated"></small>
                  <button id="carousel-refresh" className="text-button">
                    {"ニュースを更新"}
                  </button>
                </div>
              </div>
              <div
                id="workspace-news-carousel"
                className="home-news-carousel"
                role="group"
                aria-roledescription="カルーセル"
                aria-label="今日のニュース見出し"
              >
                <div className="home-news-viewport" id="carousel-content"></div>
                <div className="home-news-details">
                  <a
                    id="carousel-details"
                    className="home-news-details-link"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {"詳細を見る "}
                    <svg
                      width="13"
                      height="13"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.65"
                      aria-hidden="true"
                    >
                      <path d="M7 17 17 7M7 7h10v10" />
                    </svg>
                  </a>
                </div>
                <div className="home-news-footer">
                  <span className="home-news-auto">
                    <i id="carousel-running" data-running="false"></i>
                    <span id="carousel-state">
                      {"矢印でニュースを切り替え"}
                    </span>
                  </span>
                  <div className="home-news-controls">
                    <button
                      className="icon-button home-news-previous"
                      id="carousel-prev"
                      aria-label="前のニュース"
                    >
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.65"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                      >
                        <path d="m9 5 7 7-7 7"></path>
                      </svg>
                    </button>
                    <span id="carousel-index"></span>
                    <button
                      className="icon-button"
                      id="carousel-next"
                      aria-label="次のニュース"
                    >
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.65"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                      >
                        <path d="m9 5 7 7-7 7"></path>
                      </svg>
                    </button>
                    <button
                      className="text-button"
                      id="carousel-pause"
                      aria-pressed="true"
                    >
                      {"▷ 自動再生"}
                    </button>
                  </div>
                </div>
                <div className="home-news-position">
                  <span id="carousel-progress"></span>
                </div>
              </div>
            </section>
          </div>
          <div data-workspace-section="matches">
            <div className="home-sports" id="home-widget-sports">
              <div className="home-upcoming">
                <article className="card">
                  <div className="card-heading">
                    <h3>
                      {"今日の試合 "}
                      <span id="today-count" className="badge"></span>
                    </h3>
                    <span id="today-range" className="tiny"></span>
                  </div>
                  <div
                    id="today-games"
                    className="home-game-list"
                    aria-live="polite"
                  ></div>
                </article>
                <article className="card tomorrow-card">
                  <div className="card-heading">
                    <h3>
                      {"明日の試合 "}
                      <span id="tomorrow-count" className="badge"></span>
                    </h3>
                    <span id="tomorrow-range" className="tiny"></span>
                  </div>
                  <div
                    id="tomorrow-games"
                    className="home-game-list"
                    aria-live="polite"
                  ></div>
                </article>
              </div>
              <p id="home-schedule-note" className="home-note"></p>
            </div>
          </div>
          <div data-workspace-section="stats">
            <div id="studio-stats" className="stats-grid"></div>
          </div>
        </div>
        <div className="home-columns home-custom-layout">
          <div className="home-primary" id="workspace-primary">
            <div data-workspace-section="results">
              <section className="panel tasks-panel">
                <div className="section-header">
                  <div>
                    <h2>{"最近の試合結果"}</h2>
                  </div>
                  <a
                    className="section-link"
                    href="/football"
                    data-open-tab="football"
                  >
                    {"すべて見る "}
                    <svg
                      width="13"
                      height="13"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.65"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <path d="m9 5 7 7-7 7"></path>
                    </svg>
                  </a>
                </div>

                <div id="workspace-results"></div>
              </section>
            </div>
            <div data-workspace-section="links">
              <section className="panel">
                <div className="section-header">
                  <div>
                    <h2>{"クイックリンク"}</h2>
                  </div>
                  <a
                    className="section-link"
                    href="/links"
                    data-open-tab="links"
                  >
                    {"すべて見る "}
                    <svg
                      width="13"
                      height="13"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.65"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <path d="m9 5 7 7-7 7"></path>
                    </svg>
                  </a>
                </div>
                <div className="quick-links" id="workspace-home-links"></div>
              </section>
            </div>
          </div>
          <div className="home-secondary" id="workspace-secondary">
            <div data-workspace-section="countdown">
              <section className="panel timer-panel">
                <div className="section-header">
                  <div>
                    <h2>{"次の代表戦"}</h2>
                  </div>
                </div>
                <div className="timer" id="workspace-countdown"></div>
              </section>
            </div>
            <div data-workspace-section="upcoming">
              <section className="panel deadlines-panel">
                <div className="section-header">
                  <div>
                    <h2>{"これからの試合"}</h2>
                  </div>
                  <a
                    className="section-link"
                    href="/schedule"
                    data-open-tab="schedule"
                  >
                    {"すべて見る "}
                    <svg
                      width="13"
                      height="13"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.65"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <path d="m9 5 7 7-7 7"></path>
                    </svg>
                  </a>
                </div>
                <div id="workspace-upcoming"></div>
              </section>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
