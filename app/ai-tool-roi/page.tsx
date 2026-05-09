import type { Metadata } from "next";
import ToolPage from "@/tools/ai-tool-roi/page";

export const metadata: Metadata = {
  title: "AIツール導入 ROI計算ツール",
  description: "AIツールの月額コストと時短効果から投資回収期間を算出。導入判断の参考に。無料ツール。",
  alternates: { canonical: "https://tools.loresync.dev/ai-tool-roi" },
};

export default function Page() {
  return <ToolPage />;
}
