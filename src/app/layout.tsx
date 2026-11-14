import type { Metadata } from "next";
import "./globals.css";
import "./workspace.css";
import "./mobile.css";
import "./typography.css";
import "./home-news.css";
import "./player-profile.css";
export const metadata: Metadata = {
  title: "HIBI SPORTS — 毎日の情報を、ひと目で。",
  description:
    "全国・地域のニュース、野球とサッカー。毎日の気になる情報をひとつに。",
  referrer: "strict-origin-when-cross-origin",
};
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ja" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
