import type React from "react";
import type { Section } from "@/types/ui";

export function Baseball({ section }: { section: Section }) {
  return (
    <>
      <section
        id="baseball"
        role="tabpanel"
        aria-labelledby="tab-baseball"
        tabIndex={0}
        hidden={section !== "baseball"}
      >
        <div className="section-title">
          <div className="title-group">
            <span className="sport-icon baseball-icon">{"⚾"}</span>
            <div>
              <h2>
                {"プロ野球 "}
                <span id="season"></span>
              </h2>
            </div>
          </div>
          <a href="https://npb.jp/" target="_blank" rel="noopener noreferrer">
            {"NPB公式サイト ↗"}
          </a>
        </div>
        <div className="baseball-layout">
          <article className="card next-card">
            <div className="card-heading">
              <h3>
                <span className="live-dot"></span>
                {" 次の試合"}
              </h3>
            </div>
            <label className="filter-label">
              {"応援するチーム "}
              <select id="team">
                <option value="all">{"すべてのチーム"}</option>
              </select>
            </label>
            <div id="baseball-games" className="games"></div>

            <details className="quiet-details source-disclosure">
              <summary>{"出典・更新情報"}</summary>
              <p className="source-time" data-time="baseballGames"></p>
              <div className="card-foot">
                {"日本時間で表示 · ポストシーズンを含む "}
                <a
                  id="baseball-source"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {"出典 ↗"}
                </a>
              </div>
            </details>
          </article>
          <article className="card standings-card">
            <div className="card-heading">
              <h3>{"リーグ順位"}</h3>
            </div>
            <div className="tabs" id="standings-tabs">
              <button data-league="c" className="selected" aria-pressed="true">
                {"セ・リーグ"}
              </button>
              <button data-league="p" aria-pressed="false">
                {"パ・リーグ"}
              </button>
            </div>
            <div id="standings" className="table-scroll"></div>

            <details className="quiet-details source-disclosure">
              <summary>{"出典・更新情報"}</summary>
              <p className="source-time" data-time="standings"></p>
              <div className="card-foot">
                {"レギュラーシーズン成績 "}
                <a
                  id="standings-source"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {"出典 ↗"}
                </a>
              </div>
            </details>
          </article>
        </div>
        <article className="card titles-card">
          <div className="card-heading">
            <div>
              <h3>
                {"個人タイトルランキング "}
                <span className="badge">{"TOP 10"}</span>
              </h3>
            </div>
            <div className="tabs compact" id="leader-tabs">
              <button className="selected" data-league="c" aria-pressed="true">
                {"セ・リーグ"}
              </button>
              <button data-league="p" aria-pressed="false">
                {"パ・リーグ"}
              </button>
              <button data-league="all" aria-pressed="false">
                {"セパ総合"}
              </button>
            </div>
          </div>
          <label className="club-filter">
            {"球団別ランキング "}
            <select id="leader-team">
              <option value="all">{"すべての球団"}</option>
            </select>
          </label>
          <div
            className="category-row"
            id="categories"
            aria-label="個人成績の部門"
          ></div>
          <div className="leader-layout">
            <div id="leader-spotlight" className="leader-spotlight"></div>
            <div id="leaders" className="table-scroll"></div>
          </div>
          <details className="quiet-details source-disclosure">
            <summary>{"出典・更新情報"}</summary>
            <div className="card-foot">
              <p id="leader-time" className="source-time"></p>
              <p id="comparison-time" className="home-note" role="status"></p>
              <span id="leader-note"></span>
              <span id="leader-source"></span>
            </div>
          </details>
        </article>
        <details className="card feature-details sports-secondary">
          <summary>{"試合結果・予告先発などを詳しく見る"}</summary>
          <details className="section-disclosure">
            <summary>{"終了した試合・スコアを見る"}</summary>
            <article className="card recent-results-card">
              <div className="card-heading">
                <h3 id="baseball-results-heading">{"応援球団の直近5試合"}</h3>
                <a href="/settings" data-open-tab="settings">
                  {"応援球団を設定 →"}
                </a>
              </div>
              <div id="baseball-results" aria-live="polite"></div>
              <details className="quiet-details source-disclosure">
                <summary>{"出典・更新情報"}</summary>
                <div className="card-foot">
                  <span data-time="baseballResults"></span>
                  <span>
                    {"終了した試合 · 日本時間 · ポストシーズンを含む"}
                  </span>
                </div>
              </details>
            </article>
          </details>
          <details className="card stat-help">
            <summary>{"勝率・ゲーム差・規定打席などの数字の見方 ⓘ"}</summary>
            <dl>
              <dt>{"勝率"}</dt>
              <dd>
                {"勝利数 ÷（勝利数＋敗戦数）。引き分けは分母に含めません。"}
              </dd>
              <dt>{"ゲーム差"}</dt>
              <dd>
                {
                  "首位との距離の目安。一般に「首位の勝数 − 自チームの勝数 ＋ 自チームの敗数 − 首位の敗数」÷ 2で計算します。勝率で順位が決まるため、同じゲーム差でも順位が異なることがあります。"
                }
              </dd>
              <dt>{"規定打席・規定投球回"}</dt>
              <dd>
                {
                  "打率・出塁率・防御率の比較に必要な出場量の基準です。このサイトはNPB公式ランキングの対象者を表示します。"
                }
              </dd>
              <dt>{"前回比"}</dt>
              <dd>
                {
                  "前回公開された取得データとの比較です。前日比や1試合ごとの変化ではありません。↑は順位上昇、↓は下降。数値の＋／−は成績の増減です。防御率は低いほど上位です。前回に対象選手がいない場合は比較しません。"
                }
              </dd>
            </dl>
          </details>
          <details className="card feature-details">
            <summary>{"優勝・CS争い／予告先発／応援球団の調子"}</summary>
            <h3>{"リーグの争い"}</h3>
            <div id="pennant-race" className="table-scroll"></div>
            <p className="note">
              {
                "一軍レギュラーシーズン143試合からの残り試合数です。順位・ゲーム差は取得時点。進出確定や優勝マジックの判定ではありません。"
              }
            </p>
            <h3>{"予告先発の対戦カード"}</h3>
            <div id="starting-pitchers"></div>
            <h3>{"応援球団の調子"}</h3>
            <div id="team-form"></div>
          </details>
        </details>
      </section>
    </>
  );
}
