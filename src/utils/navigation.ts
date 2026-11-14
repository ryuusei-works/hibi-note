import type { Section } from "@/types/ui";
export const sections: Section[] = [
  "home",
  "news",
  "baseball",
  "football",
  "draft",
  "schedule",
  "links",
  "settings",
  "guide",
];
export const sectionLabels: Record<Section, string> = {
  home: "ホーム",
  news: "ニュース",
  baseball: "プロ野球",
  football: "サッカー日本代表",
  draft: "野球集計",
  schedule: "スケジュール",
  links: "リンク",
  settings: "設定",
  guide: "使い方・更新について",
};
export const sectionDescriptions: Record<Section, string> = {
  home: "今日も、ひとつずつ。気になるスポーツをチェックしましょう。",
  news: "全国・地域のニュースを、ひとつの場所に。",
  baseball: "次の一戦も、タイトルの行方も。プロ野球の今をひと目で。",
  football: "次の代表戦と世界の順位。SAMURAI BLUEを、もっと身近に。",
  draft: "7部門・5巡のドラフトで、2つの軍の成績を比較。",
  schedule: "次の一戦を、見逃さないために。",
  links: "いつも使う情報源を、ひとつに。",
  settings: "目的のカテゴリを開いて、自分に合った使い方に。",
  guide: "知りたい情報へ、迷わず。はじめての方はこちらから。",
};
export function isSection(value: string): value is Section {
  return sections.includes(value as Section);
}
