import type React from "react";
import type { Section } from "@/types/ui";

export function Guide({ section }: { section: Section }) {
  return (
    <>
      <section
        id="guide"
        role="region"
        aria-labelledby="guide-heading"
        tabIndex={-1}
        hidden={section !== "guide"}
      >
        <div className="guide-welcome card">
          <div>
            <span className="eyebrow">{"WELCOME TO HIBI SPORTS"}</span>
            <h2 id="guide-heading">
              {"はじめてのHibi Sports。"}
              <br />
              {"この順番で使ってみよう。"}
            </h2>
            <p>
              {"まず「設定」で地域と応援球団を選択。"}
              <br />
              {"ニュース・試合結果・野球集計を、自分のペースで。"}
            </p>
            <div className="guide-actions">
              <a
                className="primary-button"
                href="/baseball"
                data-open-tab="baseball"
              >
                {"野球をチェック "}
                <span>{"→"}</span>
              </a>
              <a
                className="secondary-button"
                href="/football"
                data-open-tab="football"
              >
                {"日本代表をチェック "}
                <span>{"→"}</span>
              </a>
            </div>
          </div>
          <div className="guide-art" aria-hidden="true">
            <div className="art-orbit"></div>
            <span className="art-ball">{"⚾"}</span>
            <span className="art-football">{"⚽"}</span>
            <span className="art-star">{"✦"}</span>
            <div className="art-label">{"YOUR HIBI SPORTS"}</div>
          </div>
        </div>
        <article className="card feature-details">
          <h3>{"便利な機能の使い方"}</h3>
          <ol className="guide-steps">
            <li>
              {
                "メニューからニュース・野球・サッカーへ移動できます。選手名を押すと詳しいプロフィールを表示します。"
              }
            </li>
            <li>
              {
                "「集中表示」で要点を表示し、各カードの「詳しく」を押すと詳細を開きます。"
              }
            </li>
            <li>
              {
                "ホームはニュースとスポーツの要約を表示。カレンダーはスケジュールページで確認できます。設定でニュースと試合予定の順番を変更できます。"
              }
            </li>
            <li>
              {
                "サッカーの折りたたみを開いて結果・対戦成績・メンバー・海外組・ランキング推移を確認。選手名を押すと、生年月日・身長／体重、代表出場数・デビュー戦、所属クラブ・国・今週の試合、所属チーム歴を確認できます。"
              }
            </li>
            <li>
              {
                "先発11人はフォーメーションを選択し、ピッチの各枠から指名。画像ボタンで確認してPNGを保存できます。"
              }
            </li>
            <li>
              {
                "設定の「明暗」「背景」で着せ替え。変更したらJSONを保存すると、新しい表示設定と先発11人も引き継げます。"
              }
            </li>
            <li>
              {
                "設定の「前回から更新された情報」は、このブラウザーで前回確認した内容との差です。「すべて確認済み」で消せます。"
              }
            </li>
          </ol>
          <p className="note">
            {
              "データの取得範囲・基準日・取得失敗は各欄と下の更新状況で確認できます。"
            }
          </p>
        </article>
        <div className="guide-grid">
          <article className="card guide-card">
            <span className="guide-number">{"01"}</span>
            <h3>{"まずはニュースを読む"}</h3>
            <p>
              {
                "「カテゴリ別」で総合・国内・国際・経済・IT・科学・暮らし・野球・国内サッカー・海外サッカー・エンタメを選択。「地域」では都道府県のニュースを表示します。各3件です。"
              }
            </p>
            <ul className="guide-steps">
              <li>{"地域を変える：ホーム上部の「表示する地域」を選択。"}</li>
              <li>
                {
                  "あとで読む：記事の「保存」を押し、設定の「あとで読む」から確認。"
                }
              </li>
            </ul>
            <a href="/" data-open-tab="home">
              {"ホームを開く →"}
            </a>
          </article>
          <article className="card guide-card">
            <span className="guide-number">{"02"}</span>
            <h3>{"試合の予定と結果を確認する"}</h3>
            <p>
              {
                "ニュースページには今日・明日の試合、スケジュールページには月間カレンダーを表示します。カレンダーの日付を押すと、その日の試合を確認できます。"
              }
            </p>
            <ul className="guide-steps">
              <li>
                {
                  "終了した試合：チーム名とスコアを確認。スコアがない場合は「未取得」と表示。"
                }
              </li>
              <li>
                {"野球：次の試合、直近の結果、セパ順位、個人ランキングを確認。"}
              </li>
              <li>
                {
                  "サッカー：日本代表の予定・結果、FIFA順位、上位国の試合を確認。"
                }
              </li>
            </ul>
            <a href="/baseball" data-open-tab="baseball">
              {"野球を開く →"}
            </a>
          </article>
          <article className="card guide-card">
            <span className="guide-number">{"03"}</span>
            <h3>{"野球集計でシーズン勝負する"}</h3>
            <p>
              {
                "最初に年度と軍名を設定し、7部門で両軍それぞれ第1巡〜第5巡の選手を指名します。"
              }
            </p>
            <ul className="guide-steps">
              <li>
                {
                  "① 部門を選ぶ → 巡の欄を開く → 球団・選手を選択。名前で検索できます。"
                }
              </li>
              <li>
                {"② 指名が終わったら「指名を確定・ロック」で誤操作を防止。"}
              </li>
              <li>
                {"③ 「比較」で同じ巡を見比べ、月ごとの推移で成績の変化を確認。"}
              </li>
              <li>
                {"2027年度から両軍・全部門で同じ選手の重複指名はできません。"}
              </li>
              <li>
                {
                  "打率・防御率は規定対象者の平均、その他は合計。未指名・未取得は判定待ちです。"
                }
              </li>
            </ul>
            <details>
              <summary>{"選手詳細・共有画像・記録・遊び方"}</summary>
              <ul className="guide-steps">
                <li>
                  {
                    "選手名を押すと、同じ年度の打撃・投手成績をまとめて確認できます。規定未達の成績も表示し、集計対象とは区別します。"
                  }
                </li>
                <li>
                  {
                    "「エンブレム・共有画像・シーズンの記録・予言封筒」を開くと、両軍のロゴを作れます。色・マーク・イニシャルは年度別に保存します。"
                  }
                </li>
                <li>
                  {
                    "「共有画像をプレビュー」で7部門の指名と成績を確認し、「PNG画像を保存」。保存済みの最終結果も画像にできます。"
                  }
                </li>
                <li>
                  {
                    "全日程終了・指名ロック・全7部門の集計完了後、「この年度の最終結果を保存」。翌年度も「保存した最終結果」で振り返れます。"
                  }
                </li>
                <li>
                  {
                    "予言封筒は優勝球団と両軍の勝敗、明日以降の開封日を選んで封印。指定日に開封ボタンを押すと予想を確認できます。"
                  }
                </li>
                <li>
                  {
                    "指名時の演出は「設定」でオフにできます。エンブレム・封筒・最終結果もJSONで引き継げます。"
                  }
                </li>
              </ul>
            </details>
            <a href="/draft" data-open-tab="draft">
              {"野球集計を開く →"}
            </a>
          </article>
          <article className="card guide-card">
            <span className="guide-number">{"04"}</span>
            <h3>{"自分好みに整える・データを引き継ぐ"}</h3>
            <p>
              {
                "設定ではテーマカラー・地域・応援球団と、ホームの表示順を変更できます。"
              }
            </p>
            <ul className="guide-steps">
              <li>
                {"別ブラウザーへの引き継ぎ：旧ブラウザーで「JSONを保存」。"}
              </li>
              <li>
                {
                  "新ブラウザーで「JSONを選んで読み込む」→ 内容を確認 →「この内容を読み込む」。"
                }
              </li>
              <li>
                {
                  "読み込み対象の指名や設定は上書きされます。先に現在のJSONを保存すると安心です。"
                }
              </li>
              <li>
                {"設定・指名は端末内に保存します。自動同期はありません。"}
              </li>
            </ul>
            <a href="/settings" data-open-tab="settings">
              {"設定を開く →"}
            </a>
          </article>
          <article className="card guide-card" id="live-update-guide">
            <span className="guide-number">{"05"}</span>
            <h3>{"データを最新にする"}</h3>
            <p>
              {
                "画面上部の更新ボタンを押してください。ヘッダーの「データ取得・集計完了」で取得時刻を確認できます。"
              }
            </p>
            <ul className="guide-steps">
              <li>
                {
                  "Vercel版の「最新情報に更新」はログイン不要。取得に数十秒〜3分ほどかかる場合があります。"
                }
              </li>
              <li>
                {
                  "5分以内の連続操作は取得済みデータを表示します。失敗時は前回の画面を残します。"
                }
              </li>
              <li>
                {
                  "公式サイトが未更新なら結果は変わりません。試合速報ではありません。"
                }
              </li>
            </ul>
            <a href="/" data-open-tab="home">
              {"ホームに戻る →"}
            </a>
          </article>
          <article className="card guide-card">
            <span className="guide-number">{"06"}</span>
            <h3>{"ランキング・成績の読み方"}</h3>
            <p>
              {
                "野球はリーグ別・セパ総合・球団別で切り替えられます。数字の説明は表の説明欄を開いて確認できます。"
              }
            </p>
            <ul className="guide-steps">
              <li>
                {
                  "個人ランキングは10位タイまで表示。セパ総合・球団別は独自集計です。"
                }
              </li>
              <li>
                {
                  "FIFAランキングは最新の公式発表。勝敗シミュレーションは他国の結果を固定した目安です。"
                }
              </li>
              <li>
                {"各データの「出典」から、掲載元の最新情報を確認できます。"}
              </li>
            </ul>
            <a href="/football" data-open-tab="football">
              {"サッカーを開く →"}
            </a>
          </article>
        </div>
        <details className="card feature-details" id="data-health">
          <summary>{"データごとの更新状況"}</summary>
          <div id="data-health-list" className="table-scroll"></div>
        </details>
        <details className="sources card" open>
          <summary>
            {"データの更新・出典について "}
            <span>{"＋"}</span>
          </summary>
          <p id="sources-update-note">
            {
              "Yahoo!ニュース・ゲキサカ・NPB・JFA・FIFA・ESPNの無料公開情報を30分ごとに取得し、公開データを更新する予定です。有料API・APIキーは使用しません。この画面は15分ごとに公開済みデータを読み直します。「データを再確認」では公式サイトの再取得は行いません。自動更新は遅延・停止することがあり、試合速報ではありません。"
            }
          </p>
          <p>
            {
              "各欄の出典から公式情報を確認できます。FIFAの「現在」は最新の公式発表を意味し、試合途中の暫定順位ではありません。セパ総合は独自集計で、NPBの公式タイトルではありません。同順位は同じ順位を付け、10位タイまで表示します。規定対象者が10人未満の場合は全員を表示します。"
            }
          </p>
          <p id="fetched-at"></p>
        </details>
      </section>
    </>
  );
}
