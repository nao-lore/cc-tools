import type { Metadata } from "next";
import ToolPage from "@/tools/ai-cost-calculator/page";

export const metadata: Metadata = {
  title: "AI API コスト計算 — ChatGPT / Claude / Gemini 料金シミュレーター",
  description: "ChatGPT (GPT-4o)、Claude (Opus/Sonnet/Haiku)、Gemini (Pro/Flash) のAPI料金をトークン数から即座に計算。月額コストシミュレーション付き。無料・登録不要。",
  alternates: { canonical: "https://tools.loresync.dev/ai-cost-calculator" },
};

export default function Page() {
  return <ToolPage />;
}
