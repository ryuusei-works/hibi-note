import type React from "react";
import type { Section } from "@/types/ui";

export function Football({ section }: { section: Section }) {
  return (
    <>
      <section
        id="football"
        role="tabpanel"
        aria-labelledby="tab-football"
        tabIndex={0}
        hidden={section !== "football"}
      >
        <div className="section-title">
          <div className="title-group">
            <span className="sport-icon football-icon">{"⚽"}</span>
            <div>
              <h2>
                {"サッカー日本代表 "}
                <span>{"SAMURAI BLUE"}</span>
              </h2>
            </div>
          </div>
          <a
            href="https://www.jfa.jp/samuraiblue/"
            target="_blank"
            rel="noopener noreferrer"
          >
            {"JFA公式サイト ↗"}
          </a>
        </div>
        <p id="kickoff-countdown" className="countdown" aria-live="polite"></p>
        <div className="football-layout">
          <article className="card football-match">
            <div className="card-heading">
              <h3>{"次の代表戦"}</h3>
            </div>
            <div id="football-game"></div>

            <details className="quiet-details source-disclosure">
              <summary>{"出典・更新情報"}</summary>
              <p className="source-time" data-time="footballGames"></p>
              <div className="card-foot">
                <a
                  id="football-source"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {"JFA公式日程 ↗"}
                </a>
              </div>
            </details>
          </article>
          <article className="card fifa-card">
            <div className="card-heading">
              <h3>{"FIFAランキング"}</h3>
              <span className="badge blue-badge">{"男子代表・公式発表"}</span>
            </div>
            <div id="fifa-summary"></div>

            <details className="quiet-details source-disclosure">
              <summary>{"出典・更新情報"}</summary>
              <p className="source-time" data-time="fifa"></p>
              <div className="card-foot">
                <span id="fifa-date"></span>
                <a
                  href="https://inside.fifa.com/fifa-rankings/world-ranking/men"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {"FIFA公式 ↗"}
                </a>
              </div>
            </details>
          </article>
        </div>
        <article className="card football-recent-card">
          <div className="card-heading">
            <h3>{"日本代表の直近結果"}</h3>
          </div>
          <label>
            {"表示件数"}
            <select id="football-result-limit">
              <option value="5">{"直近5試合"}</option>
              <option value="10">{"直近10試合"}</option>
            </select>
          </label>
          <div id="football-results-list" className="result-list"></div>
          <details className="card feature-details quiet-details">
            <summary>{"相手国ごとの対戦成績"}</summary>
            <h3>{"相手国ごとの対戦成績"}</h3>
            <p id="head-to-head-coverage" className="note"></p>
            <div id="head-to-head" className="table-scroll"></div>
          </details>
        </article>
        <article className="card squad-panel" aria-labelledby="squad-heading">
          <div className="card-heading">
            <h3 id="squad-heading">{"代表メンバー・前回からの変更"}</h3>
            <span id="squad-count" className="badge"></span>
          </div>
          <p id="squad-source" className="note"></p>
          <section
            className="squad-comparison"
            aria-labelledby="squad-changes-heading"
          >
            <h4 id="squad-changes-heading">{"前回からの変更"}</h4>
            <div id="squad-changes"></div>
          </section>
          <div id="squad-list" className="squad-groups"></div>
        </article>
        <details className="card feature-details sports-secondary ranking-secondary">
          <summary>{"勝敗シミュレーション・上位国・対戦相手"}</summary>
          <article className="card roadmap">
            <div className="card-heading">
              <div>
                <h3>{"次の代表戦、勝敗で順位はどう変わる？"}</h3>
              </div>
              <span className="roadmap-arrow">{"↗"}</span>
            </div>
            <div id="roadmap"></div>
            <div id="simulator" hidden>
              <div className="sim-controls">
                <div className="simulation-opponent">
                  {"次の対戦相手"}
                  <strong id="opponent"></strong>
                </div>
                <label>
                  {"試合の種類"}
                  <select id="importance">
                    <option value="">{"試合の種類を選択"}</option>
                    <option value="10">{"親善試合（国際ウィンドウ内）"}</option>
                    <option value="5">{"親善試合（国際ウィンドウ外）"}</option>
                    <option value="25">{"W杯・大陸選手権予選"}</option>
                    <option value="35">{"大陸選手権（準々決勝より前）"}</option>
                    <option value="40">{"大陸選手権（準々決勝以降）"}</option>
                    <option value="50">{"W杯（準々決勝より前）"}</option>
                    <option value="60">{"W杯（準々決勝以降）"}</option>
                  </select>
                </label>
              </div>
              <p id="simulation-assumption" className="source-time"></p>
              <div id="simulation" className="simulation"></div>
              <p className="note">
                {
                  "試算は通常の勝ち・引き分け・負けの場合。PK戦、決勝トーナメントのポイント減免は対象外です。日本と対戦相手のポイントを同時に増減させ、他国は最新公式ポイントで固定した概算です。同ポイント時の公式順位決定や他国の試合結果は反映しません。順位上昇を保証するものではありません。"
                }
              </p>
            </div>
            <details className="quiet-details source-disclosure">
              <summary>{"出典・更新情報"}</summary>
              <div className="card-foot">
                {"算式：P = Pbefore + I × (W − We) "}
                <a
                  href="https://inside.fifa.com/fifa-rankings/world-ranking/procedure-men"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {"FIFA算定方法 ↗"}
                </a>
              </div>
            </details>
          </article>
          <article className="card rivals-card">
            <div className="card-heading">
              <div>
                <h3>{"日本より上位の国の試合"}</h3>
              </div>
              <span id="rivals-count" className="badge"></span>
            </div>
            <div
              id="rivals-view"
              className="tabs home-news-tabs"
              aria-label="上位国の表示範囲"
            >
              <button
                data-rivals-scope="near"
                className="selected"
                aria-pressed="true"
              >
                {"日本に近い3か国"}
              </button>
              <button data-rivals-scope="all" aria-pressed="false">
                {"上位すべて"}
              </button>
            </div>
            <details className="quiet-details">
              <summary>{"表示内容について"}</summary>
              <p className="note daily-note">
                {
                  "国ごとに次の3試合と直近3試合の結果を表示します。相手の順位は試合当時ではなく、最新公式FIFAランキングです。時刻は日本時間。ESPN掲載分のため、未収録・変更の可能性があります。"
                }
              </p>
            </details>
            <div id="football-rivals" className="rivals-list"></div>
            <details className="quiet-details source-disclosure">
              <summary>{"出典・更新情報"}</summary>
              <div className="card-foot">
                <span data-time="footballRivals"></span>
                <span>{"日程・結果：ESPN ／ 順位：FIFA"}</span>
              </div>
            </details>
          </article>
          <details className="section-disclosure">
            <summary>{"前回の結果・対戦相手の紹介を見る"}</summary>
            <div className="football-insights">
              <article className="card">
                <div className="card-heading">
                  <h3>{"前回の代表戦"}</h3>
                </div>
                <div id="football-result"></div>
                <details className="quiet-details source-disclosure">
                  <summary>{"出典・更新情報"}</summary>
                  <div className="card-foot">
                    <span data-time="footballHistory"></span>
                    <span>{"男子日本代表 · 日本時間"}</span>
                  </div>
                </details>
              </article>
              <article className="card">
                <div className="card-heading">
                  <h3>{"次の対戦相手を知る"}</h3>
                </div>
                <div id="opponent-profile"></div>
                <details className="quiet-details source-disclosure">
                  <summary>{"出典・更新情報"}</summary>
                  <div className="card-foot">
                    <span data-time="fifa"></span>
                    <span data-time="footballHistory"></span>
                  </div>
                </details>
              </article>
            </div>
          </details>
        </details>
        <details className="card feature-details sports-secondary">
          <summary>{"観戦ツール・過去の推移"}</summary>
          <details className="card feature-details">
            <summary>{"自分の先発11人を作る"}</summary>
            <p className="note">
              {
                "現在の掲載メンバーから選びます。実際の先発発表とは異なる、自分用の予想です。各枠の選択で配置し、同じ選手は重複できません。"
              }
            </p>
            <div className="lineup-controls">
              <label>
                {"フォーメーション"}
                <select id="lineup-formation">
                  <option value="4-3-3">{"4-3-3"}</option>
                  <option value="4-2-3-1">{"4-2-3-1"}</option>
                  <option value="3-4-2-1">{"3-4-2-1"}</option>
                </select>
              </label>
              <button id="lineup-export" className="secondary-button">
                {"先発11人を画像にする"}
              </button>
            </div>
            <div id="lineup-pitch" className="lineup-pitch"></div>
            <p id="lineup-status" className="note" role="status"></p>
            <img
              id="lineup-image"
              className="share-preview"
              hidden
              alt="自分の先発11人の共有画像"
            />
            <a
              id="lineup-download"
              className="secondary-button"
              hidden
              download="hibi-note-starting-eleven.png"
            >
              {"PNG画像を保存"}
            </a>
          </details>
          <details className="card feature-details">
            <summary>{"FIFAランキングの推移"}</summary>
            <label>
              {"日本と比較する国"}
              <select id="fifa-history-country"></select>
            </label>
            <label>
              {"比較する数値"}
              <select id="fifa-history-metric">
                <option value="rank">{"順位"}</option>
                <option value="points">{"ポイント"}</option>
              </select>
            </label>
            <div id="fifa-history-chart"></div>
            <p className="note">
              {
                "公式発表日ごとに保存します。保存開始前の履歴は補完せず、1回分のときは推移を描きません。"
              }
            </p>
          </details>
        </details>
      </section>
    </>
  );
}
