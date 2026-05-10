import type { Metadata } from "next";
import ToolPage from "@/tools/ai-tool-roi/page";

export const metadata: Metadata = {
  title: "AIツール導入 ROI計算 - 月次効果・12ヶ月純効果・回収期間を比較",
  description: "AIツールの月額コスト、初期導入費、利用人数、時短効果、定着率から月次効果と12ヶ月ROIを試算。複数ツール比較、CSV出力に対応。",
  alternates: { canonical: "https://tools.loresync.dev/ai-tool-roi" },
};

export default function Page() {
  return <ToolPage />;
}
