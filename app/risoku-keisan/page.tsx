import type { Metadata } from "next";
import ToolPage from "@/tools/risoku-keisan/page";

export const metadata: Metadata = {
  title: "利息計算 - 単利・複利シミュレーション",
  description: "元金・年利率・期間から利息額と元利合計を計算。単利・複利対応、年次推移表付き。",
  alternates: { canonical: "https://tools.loresync.dev/risoku-keisan" },
};

export default function Page() {
  return <ToolPage />;
}
