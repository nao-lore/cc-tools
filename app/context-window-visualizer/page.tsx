import type { Metadata } from "next";
import ToolPage from "@/tools/context-window-visualizer/page";

export const metadata: Metadata = {
  title: "LLMコンテキストウィンドウ比較 — GPT/Claude/Geminiの文脈長を可視化",
  description: "GPT-4o(128K)、Claude Opus(200K)、Gemini Pro(1M)のコンテキストウィンドウを視覚的に比較。トークン数を文字数・A4ページ数・本の冊数に換算。",
  alternates: { canonical: "https://tools.loresync.dev/context-window-visualizer" },
};

export default function Page() {
  return <ToolPage />;
}
