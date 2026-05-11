import type { Metadata } from "next";
import ToolPage from "@/tools/ai-cost-calculator/page";

export const metadata: Metadata = {
  title: "AI APIコスト計算ツール - OpenAI / Claude / Gemini料金比較",
  description: "OpenAI、Claude、GeminiのAPI料金を入力・cached input・出力トークン、Batch利用、リクエスト数から概算。モデル別の月額比較と円換算に対応。",
  alternates: { canonical: "https://tools.loresync.dev/ai-cost-calculator" },
};

export default function Page() {
  return <ToolPage />;
}
