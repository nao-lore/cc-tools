import type { Metadata } from "next";
import ToolPage from "@/tools/prompt-token-counter/page";

export const metadata: Metadata = {
  title: "プロンプト トークン数カウンター — ChatGPT / Claude / Gemini 対応",
  description: "プロンプトのトークン数をリアルタイム推定。ChatGPT（GPT-4o）、Claude（Sonnet）、Gemini（Pro）対応。文字数・単語数・行数・API料金も同時表示。",
  alternates: { canonical: "https://tools.loresync.dev/prompt-token-counter" },
};

export default function Page() {
  return <ToolPage />;
}
