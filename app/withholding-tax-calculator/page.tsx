import type { Metadata } from "next";
import ToolPage from "@/tools/withholding-tax-calculator/page";

export const metadata: Metadata = {
  title: "源泉徴収税 計算 — フリーランス報酬の源泉徴収額を即計算",
  description: "フリーランス報酬の源泉徴収税を即座に計算。100万円以下（10.21%）/超（20.42%）の自動判定、消費税別の計算、手取り逆算機能付き。無料・登録不要。",
  alternates: { canonical: "https://tools.loresync.dev/withholding-tax-calculator" },
};

export default function Page() {
  return <ToolPage />;
}
