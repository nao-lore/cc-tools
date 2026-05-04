import type { Metadata } from "next";
import ToolPage from "@/tools/claude-api-cost/page";

export const metadata: Metadata = {
  title: "Claude API 料金計算 — Opus / Sonnet / Haiku コストシミュレーター",
  description: "Claude API（Opus 4 / Sonnet 4 / Haiku 3.5）の料金をトークン数・リクエスト数から計算。月額コストシミュレーション、バッチAPI割引対応。無料・登録不要。",
  alternates: { canonical: "https://tools.loresync.dev/claude-api-cost" },
};

export default function Page() {
  return <ToolPage />;
}
