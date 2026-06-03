import type { Metadata } from "next";
import ToolPage from "@/tools/chat-export-converter/page";

export const metadata: Metadata = {
  title: "AI会話ログ変換ツール",
  description: "ChatGPT・Claude・Geminiのエクスポート形式を相互変換。Markdown形式でも出力。無料ツール。",
  alternates: { canonical: "https://tools.loresync.dev/chat-export-converter" },
};

export default function Page() {
  return <ToolPage />;
}
