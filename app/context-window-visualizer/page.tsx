import type { Metadata } from "next";
import ToolPage from "@/tools/context-window-visualizer/page";

export const metadata: Metadata = {
  title: "LLMコンテキストウィンドウ比較 - OpenAI / Claude / Gemini の長文入力上限",
  description: "OpenAI、Claude、Geminiのコンテキスト長と最大出力を比較。文字数をトークン、A4ページ、書籍相当に換算し、入力が収まるモデルを確認できます。",
  alternates: { canonical: "https://tools.loresync.dev/context-window-visualizer" },
};

export default function Page() {
  return <ToolPage />;
}
