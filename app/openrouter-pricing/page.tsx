import type { Metadata } from "next";
import ToolPage from "@/tools/openrouter-pricing/page";

export const metadata: Metadata = {
  title: "OpenRouter LLM料金比較 — 全モデルのコスト・速度を横断比較",
  description: "OpenRouter経由の主要LLMモデル（GPT-4o、Claude、Gemini、Llama、Mistral等）の料金・速度・コンテキスト長を横断比較。最安モデル検索・コスト試算付き。",
  alternates: { canonical: "https://tools.loresync.dev/openrouter-pricing" },
};

export default function Page() {
  return <ToolPage />;
}
