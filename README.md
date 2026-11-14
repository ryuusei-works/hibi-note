# Hibi Sports

デスクトップの WorkStudio と同じ Next.js App Router・React・TypeScript のプロジェクト構成に移行した、ニュースとスポーツのワークスペースです。WorkStudio フォルダ自体は変更していません。

## 起動

Node.js `^22.22.2 || ^24.15.0 || >=26.0.0` を使用します。

```sh
npm ci
npm run dev
```

http://localhost:3000 を開いてください。本番用は `npm run build` の後に `npm start` を実行します。

## 構成

```text
src/
  app/
    layout.tsx              共通レイアウト・メタデータ・CSS
    page.tsx                ホーム
    [section]/page.tsx      各画面のルート
    api/data/route.ts       スポーツデータAPI
    globals.css             基本スタイル
    workspace.css           WorkStudioの表示・スポーツ用スタイル
    icon.svg
  components/
    Dashboard.tsx           クライアント側の画面入口
    DashboardView.tsx       共通のヘッダー・画面構成
    Sidebar.tsx             サイドバー
    Home.tsx                ホーム
    News.tsx                ニュース
    Baseball.tsx            プロ野球
    Football.tsx            日本代表
    Draft.tsx               野球集計
    Schedule.tsx            スケジュール
    LinkCards.tsx           リンク
    Settings.tsx            設定
    Guide.tsx               使い方
    SportsDialogs.tsx      選手詳細・画像出力
    WorkspaceDialogs.tsx   リンク編集ダイアログ
  hooks/
    useDashboard.ts         初期化・Reactの終了処理
  services/
    sports-data.ts          外部データ取得・キャッシュ・代替データ
    sports.js               既存の集計・指名・表示処理
    workspace.js            設定・リンク・バックアップ処理
    lifecycle.ts            イベント・タイマー・通信の終了処理
  types/                    共通型
  utils/                    画面名・ルート判定
  data/sports.json          通信できない場合の取得済みデータ
public/assets/              画像
tests/                      SSR・操作・API・HTTP確認
```

画面のマークアップは JSX コンポーネントに分割しています。既存の集計・SVG・表・フォームを更新する DOM 処理は `services` に残して引き継ぎ、`useDashboard` から初期化します。React Strict Mode の再初期化と画面終了時にイベント・タイマー・通信を解除します。`index.html` や独立した `server.mjs` は使用しません。

## 画面

`/`、`/news`、`/baseball`、`/football`、`/draft`、`/schedule`、`/links`、`/settings`、`/guide` に対応します。各URLへの直接アクセス・再読み込みができます。削除済みの `/notes` と存在しないルートは404になります。

開始・終了、電車の旅、今日のチェック、あとで読むニュース、観戦メモは削除済みです。設定は参照サイトのカテゴリリンク・開閉パネル・カード構成を使い、「表示・メニュー」「スポーツ・ニュース」「バックアップ・データ」に整理しています。12色のテーマ、プロフィール、ホーム配置・並び順、メニュー、地域、応援球団を設定できます。

## 保存・データ取得

localStorage の保存キーを引き継いでいるため、**同じブラウザー・同じURL（ホストとポート）**で起動すれば、プロフィール・リンク・表示設定・指名を引き続き使用できます。削除した機能の設定はワークスペースの読み込み時に除外します。別ポートや別ブラウザーへの引き継ぎにはJSONを保存・読み込みしてください。

バックアップはプロフィール・ホーム配置・メニュー・リンクと、テーマ・地域・球団・先発11人・野球指名・記録を1つのJSONにまとめます。読み込み前に確認画面を表示します。従来のワークスペースJSONとスポーツJSONにも対応します。

`/api/data` は GitHub Pages の公開JSONからデータを取得し、成功したデータを5分間キャッシュします。同時アクセスでは通信を共有し、通信失敗時には最後の取得済みデータか同梱データを返します。設定・指名・バックアップファイルは外部へ送信しません。

代表戦の開始時刻はJFAの大会別放送ページにある「キックオフ（日本時間）」から補完します。ホーム・代表戦・試合カレンダーは同じ時刻を使い、未発表の時刻を午前0時として計算しません。

ニュースは独立した `/api/news` からYahoo!ニュース・ゲキサカの公開RSSを取得します。画面表示中は1分ごと、タブに戻った時、地域変更時に確認します。「ニュースを更新」は1分キャッシュを使わず再取得します。ニュースの取得日時と記事の配信日時を区別し、失敗時は前回分と元の取得日時を残して更新失敗を表示します。スポーツの取得済みデータが古くてもニュースの更新を止めません。

## 確認

```sh
npm run typecheck
npm test
npm run build
```

テストでは全画面のSSR、ReactのハイドレーションとStrict Mode、旧保存データの移行、削除機能の不在、テーマと明暗、ホーム配置、リンク追加、ニュース切替、JSON保存・復元、イベント解除、APIの代替データとキャッシュを確認します。

本番用サーバーを起動した状態で、HTTP配信も確認できます。

```sh
node tests/http-smoke.mjs http://127.0.0.1:3000
```

ブラウザー画面の目視確認はコンピューター操作環境が利用できないため未実施です。公開・デプロイは行っていません。移行前のファイルは `/tmp/hibi-before-next/original-project` に退避しています（一時ディレクトリなので長期保管先ではありません）。

## 本番デプロイと定期収集

Vercelは`vercel.json`でNext.jsとしてビルドし、既存の公開URLを継続します。`main`へのpushで自動デプロイします。

`collector/`は移行前の公開データ収集処理を引き継ぎ、GitHub Actionsで毎時11分・41分とmain更新時に実行します。収集JSONだけを既存GitHub Pagesの`data/sports.json`へ公開します。月次・FIFA履歴は前回公開データから継承します。全取得失敗時は既存公開を保持します。

`/api/data`はこのJSONを取得するため、本番URLを置き換えても自己参照しません。ニュースは引き続き独立したRSS取得です。定期実行の時刻は保証されません。

収集処理は`cd collector`後に`npm ci --ignore-scripts`、`npm test`、`npm run build`で確認できます。
