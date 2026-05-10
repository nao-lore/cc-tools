import type { Metadata } from "next";
import ToolPage from "@/tools/claude-api-cost/page";

export const metadata: Metadata = {
  title: "Claude API 料金計算 - Opus 4.7・Sonnet 4.6・Haiku 4.5の月額概算",
  description: "Claude APIの料金を、通常入力、Prompt caching、出力、Batch API、Web search、為替レートから日本円で概算します。",
  alternates: { canonical: "https://tools.loresync.dev/claude-api-cost" },
};

export default function Page() {
  return <ToolPage />;
}
