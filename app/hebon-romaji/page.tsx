import type { Metadata } from "next";
import ToolPage from "@/tools/hebon-romaji/page";

export const metadata: Metadata = {
  title: "ヘボン式ローマ字変換 - パスポート用表記の確認補助",
  description: "ひらがな・カタカナの読みをヘボン式ローマ字に変換。パスポート用の大文字表記、長音省略の目安、B/M/P前の「ん→M」変換、コピー・CSV出力に対応。",
  alternates: { canonical: "https://tools.loresync.dev/hebon-romaji" },
};

export default function Page() {
  return <ToolPage />;
}
