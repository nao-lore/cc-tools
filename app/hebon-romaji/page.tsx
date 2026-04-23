import type { Metadata } from "next";
import ToolPage from "@/tools/hebon-romaji/page";

export const metadata: Metadata = {
  title: "ヘボン式ローマ字変換 — パスポート申請対応・無料オンライン",
  description: "ひらがな・カタカナを外務省基準のヘボン式ローマ字に変換。パスポート申請用の大文字変換・長音省略・ん→m変換に対応。氏名のローマ字表記確認に。",
  alternates: { canonical: "https://tools.loresync.dev/hebon-romaji" },
};

export default function Page() {
  return <ToolPage />;
}
