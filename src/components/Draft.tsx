import type React from "react";
import type { Section } from "@/types/ui";

export function Draft({ section }: { section: Section }) {
  return (
    <>
      <section
        id="draft"
        role="tabpanel"
        aria-labelledby="tab-draft"
        tabIndex={0}
        hidden={section !== "draft"}
      >
        <article className="card draft-intro">
          <div className="card-heading">
            <div>
              <span className="eyebrow">{"SEASON DRAFT"}</span>
              <h2>
                {"野球集計 "}
                <span id="draft-year"></span>
              </h2>
            </div>
            <span id="draft-season" className="badge"></span>
          </div>
          <p className="note">
            {
              "2つの軍で、7部門・各5人を指名。シーズン成績は公開データの更新に合わせて自動で反映します。"
            }
          </p>
          <label className="draft-year-picker">
            {"集計する年度"}
            <select id="draft-year-select" aria-label="野球集計の年度"></select>
          </label>
          <p id="draft-year-note" className="note"></p>
          <div className="draft-names">
            <label>
              {"A軍の名前"}
              <input
                id="draft-name-a"
                maxLength={24}
                defaultValue="A軍"
                autoComplete="off"
              />
            </label>
            <label>
              {"B軍の名前"}
              <input
                id="draft-name-b"
                maxLength={24}
                defaultValue="B軍"
                autoComplete="off"
              />
            </label>
          </div>
          <div className="draft-lock-controls">
            <button
              id="draft-lock"
              className="secondary-button"
              aria-pressed="false"
            >
              {"指名を確定・ロック"}
            </button>
            <span id="draft-lock-status" role="status" className="note"></span>
          </div>
          <p id="draft-duplicate-rule" className="note"></p>
          <p
            id="draft-duplicate-warning"
            className="draft-conflict-warning"
            role="status"
            hidden
          ></p>
          <p id="draft-save-status" className="note" role="status">
            {
              "軍名・指名はこのブラウザーに年度ごとに保存します。自動共有はされません。設定のJSON保存・読み込みで別ブラウザーに引き継げます。"
            }
          </p>
        </article>
        <article className="card draft-summary">
          <div className="card-heading">
            <h3>{"7部門の対戦成績"}</h3>
            <span id="draft-score" role="status"></span>
          </div>
          <div
            id="draft-overview"
            className="draft-table-scroll"
            aria-live="polite"
          ></div>
        </article>
        <details className="card draft-tools">
          <summary>{"エンブレム・共有画像・シーズンの記録・予言封筒"}</summary>
          <p
            id="draft-tools-status"
            className="note tool-status"
            role="status"
            aria-live="polite"
          ></p>
          <div className="draft-tools-grid">
            <section className="tool-block">
              <h3>{"両軍のエンブレム"}</h3>
              <p className="note">
                {"カラー・マーク・イニシャルを年度ごとに保存します。"}
              </p>
              <div id="emblem-editors" className="draft-tools-grid"></div>
            </section>
            <section className="tool-block">
              <h3>{"指名と成績を画像で保存"}</h3>
              <p className="note">
                {
                  "7部門・両軍の指名と成績を1枚のPNGにします。画像はこのブラウザーで作り、外部へ送りません。"
                }
              </p>
              <label>
                {"画像にする内容"}
                <select id="share-source">
                  <option value="current">{"表示中の年度・現在の指名"}</option>
                </select>
              </label>
              <div className="tools-actions">
                <button id="share-open" className="secondary-button">
                  {"共有画像をプレビュー"}
                </button>
              </div>
              <h3>{"最終結果を保存"}</h3>
              <p id="season-save-note" className="note"></p>
              <button id="season-save" className="secondary-button" disabled>
                {"この年度の最終結果を保存"}
              </button>
            </section>
            <section className="tool-block">
              <h3>{"開幕前の「予言封筒」"}</h3>
              <p id="prediction-season-note" className="note"></p>
              <div id="prediction-form">
                <label>
                  {"セ・リーグ優勝予想"}
                  <select id="prediction-central"></select>
                </label>
                <label>
                  {"パ・リーグ優勝予想"}
                  <select id="prediction-pacific"></select>
                </label>
                <label>
                  {"両軍の勝敗予想"}
                  <select id="prediction-winner">
                    <option value="0">{"A軍の勝利"}</option>
                    <option value="1">{"B軍の勝利"}</option>
                    <option value="draw">{"引き分け"}</option>
                  </select>
                </label>
                <label>
                  {"開封する日（日本時間）"}
                  <input
                    id="prediction-date"
                    type="date"
                    min="2026-01-01"
                    max="2200-12-31"
                  />
                </label>
                <button id="prediction-seal" className="secondary-button">
                  {"この予想を封印する"}
                </button>
              </div>
              <div id="prediction-envelope" className="envelope-closed" hidden>
                <span className="envelope-icon" aria-hidden="true">
                  {"✉"}
                </span>
                <p id="prediction-envelope-text"></p>
                <button id="prediction-open" className="secondary-button">
                  {"予言封筒を開封する"}
                </button>
                <p id="prediction-reveal" className="tool-status" hidden></p>
              </div>
            </section>
            <section className="tool-block">
              <h3>{"保存した最終結果"}</h3>
              <p className="note">
                {
                  "指名・個人成績・両軍の最終勝敗を、保存時点のまま振り返れます。翌年度も残り、JSONで引き継げます。"
                }
              </p>
              <div id="season-results"></div>
            </section>
          </div>
        </details>
        <article className="card draft-editor">
          <div className="card-heading">
            <h3 id="draft-editor-title">{"選手を指名する"}</h3>
          </div>
          <div
            id="draft-categories"
            className="tabs draft-categories"
            aria-label="集計部門"
          ></div>
          <p id="draft-rule" className="note"></p>
          <div className="tabs" id="draft-view">
            <button
              data-draft-view="edit"
              aria-pressed="true"
              className="selected"
            >
              {"指名一覧"}
            </button>
            <button data-draft-view="compare" aria-pressed="false">
              {"両軍を比較"}
            </button>
          </div>
          <div id="draft-picks" className="draft-picks"></div>
          <div id="draft-comparison" hidden></div>
          <details className="draft-month-section">
            <summary id="draft-month-title">{"月ごとの推移"}</summary>
            <p className="note">
              {
                "選択中の部門・現在の指名選手で、各月に最後に保存されたシーズン累計成績を比較します。当月は保存時点の途中経過です。月内の成績だけを集計した値ではありません。"
              }
            </p>
            <p className="note">
              {
                "保存開始前・取得失敗で保存できなかった月は未記録。前月差は連続する月が両方記録され、集計できる場合だけ表示します。指名を変えると過去の月も現在の指名で再集計します。"
              }
            </p>
            <div
              id="draft-monthly"
              className="draft-table-scroll"
              aria-live="polite"
            ></div>
          </details>
          <details className="draft-rules">
            <summary>{"集計ルール・取得日時・出典"}</summary>
            <p className="note">
              {
                "「指名を確定・ロック」でこの年度の指名と軍名の編集を止められます。修正する場合はロックを解除してください。「両軍を比較」では同じ巡の成績差を確認できます。ロック中も成績は自動更新され、設定のJSONにロック状態も保存されます。"
              }
            </p>
            <p className="note">
              {
                "本塁打・安打・打点・勝利・セーブは5人の合計。打率・防御率は規定対象者の表示成績を単純平均します（チーム全体の打数・投球回による加重平均ではありません）。防御率は低い方、他部門は高い方が優勢。各部門1勝で、7部門の勝利数を比較します。平均は表示時に丸め、優劣は丸める前の値で比較します。"
              }
            </p>
            <p className="note">
              {
                "2027年度以降は、両軍・全部門を通して同じ選手を重複指名できません（名前の空白・全半角の違いを除いて判定）。2026年度は同じ部門内だけ重複不可で、別部門では指名できます。未選択・成績不明がある部門は判定待ち。規定未達者は平均から除外し、対象者が0人の場合も判定待ちです。2026年の防御率限定で「特別枠（MLB）」の今井 達也を指名できます。成績は計測不可で、平均の対象から除外します。一軍レギュラーシーズン成績のみを使い、CS・日本シリーズは含みません。"
              }
            </p>
            <p className="note">
              {
                "球団別の公式成績に掲載された選手を選べます。移籍・改名などで一致しなくなった選手は掲載なしとなるため、選択内容を確認してください。年度が変わると新しい指名枠になり、保存済みの過年度データは上書きしません。"
              }
            </p>
            <div id="draft-sources"></div>
          </details>
        </article>
      </section>
    </>
  );
}
