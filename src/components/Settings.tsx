import type React from "react";
import type { Section } from "@/types/ui";

export function Settings({ section }: { section: Section }) {
  return (
    <>
      <section
        id="settings"
        role="tabpanel"
        aria-labelledby="tab-settings"
        tabIndex={0}
        hidden={section !== "settings"}
      >
        <nav
          id="settings-index"
          className="settings-index"
          aria-label="設定の項目"
        >
          <a href="#settings-display" data-settings-target="settings-display">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.65"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="m3 10 9-7 9 7v10H3Z"></path>
              <path d="M9 21v-8h6v8"></path>
            </svg>
            <span>
              <strong>{"表示・メニュー"}</strong>
              <small>{"左メニュー・テーマ・ホーム・プロフィール"}</small>
            </span>
            <svg
              width="20"
              height="20"
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
          <a href="#settings-sports" data-settings-target="settings-sports">
            <svg
              width="20"
              height="20"
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
            <span>
              <strong>{"スポーツ・ニュース"}</strong>
              <small>{"応援球団・地域ニュース・ドラフト"}</small>
            </span>
            <svg
              width="20"
              height="20"
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
          <a href="#settings-data" data-settings-target="settings-data">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.65"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M12 3v12m-5-5 5 5 5-5M5 16v5h14v-5"></path>
            </svg>
            <span>
              <strong>{"バックアップ・データ"}</strong>
              <small>{"保存容量・JSON・ワークスペース情報"}</small>
            </span>
            <svg
              width="20"
              height="20"
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
        </nav>
        <p className="settings-index-hint">
          {
            "項目のリンクから移動できます。各カテゴリは見出しを押すと開閉します。"
          }
        </p>
        <div className="settings-stack">
          <details
            id="settings-display"
            className="settings-category"
            tabIndex={-1}
            open
          >
            <summary>
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.65"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="m3 10 9-7 9 7v10H3Z"></path>
                <path d="M9 21v-8h6v8"></path>
              </svg>
              <span>
                <strong>{"表示・メニュー"}</strong>
                <small>{"左メニュー・テーマ・ホーム・プロフィール"}</small>
              </span>
              <svg
                width="20"
                height="20"
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
            </summary>
            <div
              id="settings-display-content"
              className="settings-stack settings-category-content"
            >
              <section className="panel settings-card ">
                <h2>{"左メニューの表示"}</h2>
                <p>
                  {
                    "使う項目だけを左メニューに表示できます。ホームと設定は常に表示します。非表示にしてもデータは残り、いつでも戻せます。"
                  }
                </p>
                <form id="workspace-menu-form">
                  <div
                    className="menu-settings-grid"
                    id="workspace-menu-settings"
                  ></div>
                  <div className="settings-buttons">
                    <button className="button primary" type="submit">
                      {"メニューの表示設定を保存"}
                    </button>
                    <button
                      className="button"
                      type="button"
                      id="workspace-menu-reset"
                    >
                      {"すべて表示に戻す"}
                    </button>
                  </div>
                </form>
              </section>
              <section className="panel settings-card desk-theme-settings">
                <h2>{"気分で変わるデスク"}</h2>
                <p>
                  {
                    "落ち着いた12色から、今日の気分に合う色を。背景は淡く、文字は読みやすい濃さに整えています。選択は自動で保存されます。"
                  }
                </p>
                <div
                  id="theme-options"
                  className="desk-theme-options"
                  aria-label="デスクのテーマ"
                  role="group"
                ></div>
              </section>
              <section className="panel settings-card ">
                <h2>{"ホームの表示・並び順"}</h2>
                <p>
                  {
                    "使う項目を選び、上へ・下へで並び替えられます。表示位置も変更できます。"
                  }
                </p>
                <form id="workspace-layout-form" className="home-layout-form">
                  <div id="workspace-layout-settings"></div>
                  <div className="settings-buttons">
                    <button className="button primary" type="submit">
                      {"ホームの表示設定を保存"}
                    </button>
                    <button
                      className="button"
                      type="button"
                      id="workspace-layout-reset"
                    >
                      {"標準の並びに戻す"}
                    </button>
                  </div>
                </form>
                <p className="settings-hint">
                  {
                    "上部（全幅）、メイン列、右列の順に表示します。各エリア内で並び替えできます。変更後は保存してください。"
                  }
                </p>
              </section>
              <section className="panel settings-card ">
                <h2>{"プロフィール"}</h2>
                <p>
                  {"サイドバーとホームの挨拶に表示する名前を変更できます。"}
                </p>
                <form
                  className="profile-settings-form"
                  id="workspace-profile-form"
                >
                  <label className="field" htmlFor="workspace-display-name">
                    <span>{"お名前"}</span>
                    <input
                      id="workspace-display-name"
                      type="text"
                      maxLength={40}
                      autoComplete="nickname"
                      placeholder="例：太郎"
                      aria-describedby="profile-hint"
                    />
                  </label>
                  <p className="settings-hint" id="profile-hint">
                    {"40文字まで。空欄で保存すると標準の表示に戻ります。"}
                  </p>
                  <button
                    className="button primary"
                    id="workspace-profile-save"
                    type="submit"
                  >
                    {"名前を保存"}
                  </button>
                </form>
              </section>
              <section className="panel settings-card ">
                <h2>{"見やすさ・背景"}</h2>
                <p>{"明暗や背景、情報の表示量を調整できます。"}</p>
                <div className="appearance-options">
                  <label>
                    {"明暗"}
                    <select id="appearance-mode">
                      <option value="auto">{"端末に合わせる"}</option>
                      <option value="light">{"ライト"}</option>
                      <option value="dark">{"ダーク"}</option>
                    </select>
                  </label>
                  <label>
                    {"背景"}
                    <select id="appearance-background">
                      <option value="plain">{"シンプル"}</option>
                      <option value="stars">{"星空"}</option>
                      <option value="rain">{"雨の窓辺"}</option>
                      <option value="paper">{"紙のノート"}</option>
                    </select>
                  </label>
                  <label>
                    <input id="appearance-motion" type="checkbox" />
                    {" 背景を動かす"}
                  </label>
                </div>
                <button
                  id="focus-toggle"
                  className="button"
                  aria-pressed="false"
                >
                  {"集中表示：オフ"}
                </button>
              </section>
            </div>
            <a
              className="settings-back-link"
              href="#settings-index"
              data-settings-target="settings-index"
            >
              {"設定の項目へ戻る ↑"}
            </a>
          </details>
          <details
            id="settings-sports"
            className="settings-category"
            tabIndex={-1}
          >
            <summary>
              <svg
                width="20"
                height="20"
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
              <span>
                <strong>{"スポーツ・ニュース"}</strong>
                <small>{"応援球団・地域ニュース・ドラフト"}</small>
              </span>
              <svg
                width="20"
                height="20"
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
            </summary>
            <div
              id="settings-sports-content"
              className="settings-stack settings-category-content"
            >
              <section className="panel settings-card ">
                <h2>{"応援球団・地域ニュース"}</h2>
                <p>
                  {
                    "よく見る球団とニュースの地域を設定できます。選択は自動で保存されます。"
                  }
                </p>
                <label className="settings-label">
                  {"応援球団"}
                  <select id="favorite-team"></select>
                </label>
                <p className="settings-hint">
                  {"試合予定の初期絞り込みと、カレンダーの ★ に反映します。"}
                </p>
                <label className="settings-label">
                  {"地域ニュースの地域"}
                  <select id="settings-region"></select>
                </label>
                <p className="settings-hint">
                  {"位置情報は取得しません。ニュース画面でも変更できます。"}
                </p>
              </section>
              <section className="panel settings-card ">
                <h2>{"ドラフトの演出"}</h2>
                <p>
                  {
                    "選手を選ぶと指名カードを表示します。端末の「動きを減らす」設定にも対応します。"
                  }
                </p>
                <label className="settings-animation">
                  <input id="draft-animation" type="checkbox" defaultChecked />
                  {" ドラフト指名の演出を表示"}
                </label>
              </section>
            </div>
            <a
              className="settings-back-link"
              href="#settings-index"
              data-settings-target="settings-index"
            >
              {"設定の項目へ戻る ↑"}
            </a>
          </details>
          <details
            id="settings-data"
            className="settings-category"
            tabIndex={-1}
          >
            <summary>
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.65"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M12 3v12m-5-5 5 5 5-5M5 16v5h14v-5"></path>
              </svg>
              <span>
                <strong>{"バックアップ・データ"}</strong>
                <small>{"保存容量・JSON・ワークスペース情報"}</small>
              </span>
              <svg
                width="20"
                height="20"
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
            </summary>
            <div
              id="settings-data-content"
              className="settings-stack settings-category-content"
            >
              <section className="panel settings-card ">
                <h2>{"ブラウザの保存容量"}</h2>
                <p>{"このワークスペースで保存しているデータの使用量です。"}</p>
                <p className="settings-hint" id="workspace-storage-usage"></p>
              </section>
              <section className="panel settings-card ">
                <h2>{"データのバックアップ"}</h2>
                <p>
                  {
                    "プロフィール・ホーム配置・メニュー・リンクと、スポーツの指名・表示設定を1つのJSONファイルに保存します。"
                  }
                </p>
                <div className="settings-buttons">
                  <button id="workspace-backup-save" className="button primary">
                    {"JSONをエクスポート"}
                  </button>
                  <label className="button">
                    {"JSONをインポート"}
                    <input
                      id="workspace-backup-file"
                      type="file"
                      accept=".json,application/json"
                      hidden
                    />
                  </label>
                </div>
                <p className="settings-hint">
                  {
                    "読み込む前に内容を確認できます。ファイルはサーバーに送信しません。"
                  }
                </p>
                <div id="workspace-backup-preview" hidden>
                  <p id="workspace-backup-preview-text"></p>
                  <div className="settings-buttons">
                    <button
                      id="workspace-backup-apply"
                      className="button primary"
                    >
                      {"この内容を読み込む"}
                    </button>
                    <button id="workspace-backup-cancel" className="button">
                      {"キャンセル"}
                    </button>
                  </div>
                </div>
                <p id="workspace-backup-status" role="status"></p>
              </section>
              <section className="panel settings-card ">
                <h2>{"このワークスペースについて"}</h2>
                <p>{"データはこのブラウザ内に保存されています。"}</p>
                <dl className="settings-info">
                  <div>
                    <dt>{"保存先"}</dt>
                    <dd>{"このブラウザ"}</dd>
                  </div>
                  <div>
                    <dt>{"保存中のデータ"}</dt>
                    <dd id="workspace-data-summary"></dd>
                  </div>
                  <div>
                    <dt>{"スポーツ情報"}</dt>
                    <dd>{"公開データから取得"}</dd>
                  </div>
                </dl>
                <p className="settings-hint">
                  {
                    "ブラウザやポートが異なるとデータは共有されません。ブラウザのデータ消去前にJSONを保存してください。"
                  }
                </p>
              </section>
              <section className="panel settings-card ">
                <h2>{"表示設定を初期状態に戻す"}</h2>
                <p>
                  {
                    "テーマ・地域・応援球団・表示方法を標準に戻します。指名とリンクは残ります。"
                  }
                </p>
                <button id="settings-reset" className="button">
                  {"設定を初期状態に戻す"}
                </button>
              </section>
            </div>
            <a
              className="settings-back-link"
              href="#settings-index"
              data-settings-target="settings-index"
            >
              {"設定の項目へ戻る ↑"}
            </a>
          </details>
        </div>
        <div className="backup-settings" hidden>
          <h3>{"データの保存・引き継ぎ"}</h3>
          <p className="note">
            {
              "テーマ・表示地域・応援球団・メニューの開閉状態・ホームの表示順・保存済み年度の野球集計（軍名・指名・ロック状態）と、エンブレム・最終結果・予言封筒・指名演出の設定をJSONで保存できます。別ブラウザーでは保存したファイルを選んで読み込んでください。ファイルはサーバーに送信しません。"
            }
          </p>
          <p id="backup-reminder" className="note" role="status"></p>
          <div className="backup-actions">
            <button id="backup-export" className="secondary-button">
              {"JSONを保存"}
            </button>
            <label className="backup-file-label">
              {"JSONを選んで読み込む"}
              <input
                id="backup-file"
                type="file"
                accept=".json,application/json"
              />
            </label>
          </div>
          <p className="note">
            {
              "読み込む設定と、ファイルに含まれる年度の指名・ロック状態を上書きします。含まれない年度は残します。公式成績は含まず、このサイトの最新データで再集計します。"
            }
          </p>
          <div id="backup-preview" className="backup-preview" hidden>
            <p id="backup-preview-text"></p>
            <div className="backup-actions">
              <button id="backup-apply" className="primary-button">
                {"この内容を読み込む"}
              </button>
              <button id="backup-cancel" className="secondary-button">
                {"キャンセル"}
              </button>
            </div>
          </div>
          <p
            id="backup-status"
            role="status"
            className="note"
            aria-live="polite"
          ></p>
        </div>
        <div hidden>
          <span id="today" hidden></span>
          <div id="home-layout-options"></div>
          <p id="settings-status" role="status">
            {
              "設定はこのブラウザー内だけに保存します。登録・ログインは不要です。"
            }
          </p>
          <details id="content-updates" className="card feature-details">
            <summary>
              {"前回から更新された情報 "}
              <span id="updates-count" className="badge"></span>
            </summary>
            <p className="note">
              {
                "このブラウザーで前回確認した内容と比較します。初回は比較を始め、取得時刻だけの変化は除きます。"
              }
            </p>
            <div id="updates-list"></div>
            <button id="updates-read" className="secondary-button">
              {"すべて確認済みにする"}
            </button>
          </details>
          <aside id="release-note" className="card release-note" hidden>
            <div>
              <strong>{"サッカーと毎日の使い勝手をアップデート"}</strong>
              <p>
                {
                  "代表選手・先発11人・結果と推移、検索・集中表示・ダークモードなどを追加しました。"
                }
              </p>
              <a href="/guide" data-open-tab="guide">
                {"使い方を見る →"}
              </a>
            </div>
            <button id="release-dismiss" className="secondary-button">
              {"確認しました"}
            </button>
          </aside>
        </div>
      </section>
    </>
  );
}
