import type { Metadata } from "next";
import ToolPage from "@/tools/tax-calculator/page";

export const metadata: Metadata = {
  title: "源泉徴収税計算ツール - フリーランス報酬の税額シミュレーション",
  description: "フリーランス・個人事業主向けの源泉徴収税額を自動計算。報酬額を入力するだけで、源泉徴収税額・手取り額を即座にシミュレーション。複数件の一括計算や年間合計表示にも対応。消費税の税込・税抜切替も可能です。",
  alternates: { canonical: "https://tools.loresync.dev/tax-calculator" },
};

export default function Page() {
  return <ToolPage />;
}
