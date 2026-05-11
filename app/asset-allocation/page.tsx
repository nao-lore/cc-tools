import type { Metadata } from "next";
import ToolPage from "@/tools/asset-allocation/page";

export const metadata: Metadata = {
  title: "アセットアロケーション計算ツール - 目標比率とリバランス差分",
  description: "現在の資産金額と目標比率から、資産配分、目標金額、買い増し・売却目安を計算。投資判断ではなくポートフォリオ整理に使える無料ツール。",
  alternates: { canonical: "https://tools.loresync.dev/asset-allocation" },
};

export default function Page() {
  return <ToolPage />;
}
