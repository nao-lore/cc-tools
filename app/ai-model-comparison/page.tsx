import type { Metadata } from "next";
import ToolPage from "@/tools/ai-model-comparison/page";

export const metadata: Metadata = {
  title: "AIモデル比較表 — ChatGPT / Claude / Gemini 料金・性能一覧",
  description: "ChatGPT (GPT-4o/4.1), Claude (Opus/Sonnet/Haiku), Gemini (Pro/Flash) の料金・コンテキスト長・最大出力・特徴を一覧比較。用途別おすすめモデル付き。",
  alternates: { canonical: "https://tools.loresync.dev/ai-model-comparison" },
};

export default function Page() {
  return <ToolPage />;
}
