import type { Metadata } from "next";
import ToolPage from "@/tools/asset-allocation/page";

export const metadata: Metadata = {
  title: "アセットアロケーション可視化ツール",
  description: "資産の配分比率を入力して円グラフで可視化。リスク・リターン目安表示。ポートフォリオ設計に。無料ツール。",
  alternates: { canonical: "https://tools.loresync.dev/asset-allocation" },
};

export default function Page() {
  return <ToolPage />;
}
