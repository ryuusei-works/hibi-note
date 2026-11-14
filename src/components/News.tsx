import type React from "react";
import type { Section } from "@/types/ui";

const categories = [
  ["general", "総合"],
  ["domestic", "国内"],
  ["world", "国際"],
  ["economy", "経済"],
  ["technology", "IT・テクノロジー"],
  ["science", "科学"],
  ["life", "暮らし"],
  ["baseball", "野球"],
  ["domestic-soccer", "国内サッカー"],
  ["overseas-soccer", "海外サッカー"],
  ["entertainment", "エンタメ"],
];

export function News({ section }: { section: Section }) {
  return (
    <section
      id="news"
      role="tabpanel"
      aria-labelledby="tab-news"
      tabIndex={0}
      hidden={section !== "news"}
    >
      <div id="home-widgets">
        <article id="home-widget-news" className="card daily-news-panel">
          <div className="card-heading news-page-heading">
            <div>
              <h3>{"今日のニュース"}</h3>
              <p>{"気になるカテゴリから、最新の見出しを。"}</p>
            </div>
            <span className="news-edition-label">{"各カテゴリ 最新3件"}</span>
          </div>
          <div
            id="home-news-tabs"
            className="tabs home-news-tabs"
            aria-label="ニュースの表示対象"
          >
            <button
              data-news-view="national"
              className="selected"
              aria-pressed="true"
              aria-controls="national-news-section"
            >
              {"カテゴリ別ニュース"}
            </button>
            <button
              data-news-view="local"
              aria-pressed="false"
              aria-controls="local-news-section"
            >
              {"地域ニュース"}
            </button>
          </div>
          <div id="national-news-section">
            <div className="news-browser">
              <nav
                id="news-categories"
                className="news-categories"
                aria-label="ニュースカテゴリ"
              >
                <p>{"カテゴリ"}</p>
                {categories.map(([id, label]) => (
                  <button
                    key={id}
                    data-news-category={id}
                    className={id === "general" ? "selected" : undefined}
                    aria-pressed={id === "general"}
                    aria-controls="national-news"
                  >
                    {label}
                  </button>
                ))}
              </nav>
              <div className="news-feed">
                <div className="news-feed-heading">
                  <h4 id="news-category-heading">{"総合ニュース"}</h4>
                  <span>{"最新の見出し"}</span>
                </div>
                <div
                  id="national-news"
                  className="news-list"
                  aria-live="polite"
                ></div>
                <details className="quiet-details news-source-details">
                  <summary>{"出典・更新情報"}</summary>
                  <div id="national-news-time" className="card-foot"></div>
                </details>
              </div>
            </div>
          </div>
          <div id="local-news-section" className="local-news-feed" hidden>
            <div className="daily-region-bar">
              <label>
                {"表示する地域"}
                <select
                  id="home-region"
                  aria-label="地域ニュースの都道府県"
                ></select>
              </label>
            </div>
            <div className="news-feed-heading">
              <h4 id="local-news-heading">{"地域ニュース"}</h4>
              <a
                id="local-news-source"
                href="https://news.yahoo.co.jp/"
                target="_blank"
                rel="noopener noreferrer"
              >
                {"配信元を見る ↗"}
              </a>
            </div>
            <div id="local-news" className="news-list" aria-live="polite"></div>
            <details className="quiet-details news-source-details">
              <summary>{"配信元・更新情報"}</summary>
              <p className="note daily-note">
                {
                  "選択した地域の地方紙・放送局がYahoo!ニュースに配信する記事です。配信元によって周辺地域や全国のニュースも含みます。"
                }
              </p>
              <div id="local-news-time" className="card-foot"></div>
            </details>
          </div>
        </article>
      </div>
    </section>
  );
}
