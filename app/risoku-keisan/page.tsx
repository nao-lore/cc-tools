import type { Metadata } from "next";
import ToolPage from "@/tools/risoku-keisan/page";

export const metadata: Metadata = {
  title: "利息計算ツール - 単利・複利・税引後の元利合計をシミュレーション",
  description: "元金・年利率・期間から単利・複利の利息、元利合計、税引後の概算受取額を計算。年次推移、コピー、CSV出力に対応。",
  alternates: { canonical: "https://tools.loresync.dev/risoku-keisan" },
};

export default function Page() {
  return <ToolPage />;
}
