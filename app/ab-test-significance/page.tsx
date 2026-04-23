import type { Metadata } from "next";
import ToolPage from "@/tools/ab-test-significance/page";

export const metadata: Metadata = {
  title: "A/Bテスト 統計的有意差計算 — p値・信頼区間・サンプルサイズ",
  description: "A/Bテストの統計的有意差をp値で判定。訪問数とCV数を入力するだけで信頼区間・リフト率・必要サンプルサイズを即計算。マーケター・開発者向け。",
  alternates: { canonical: "https://tools.loresync.dev/ab-test-significance" },
};

export default function Page() {
  return <ToolPage />;
}
