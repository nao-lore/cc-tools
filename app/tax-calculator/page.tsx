import type { Metadata } from "next";
import ToolPage from "@/tools/tax-calculator/page";

export const metadata: Metadata = {
  title: "源泉徴収税計算ツール - 報酬・消費税・差引支払額を計算",
  description: "フリーランス報酬の源泉徴収税額、消費税、税込報酬、差引支払額を計算。100万円超、税抜入力、税込入力、税込総額のみの扱いに対応。",
  alternates: { canonical: "https://tools.loresync.dev/tax-calculator" },
};

export default function Page() {
  return <ToolPage />;
}
