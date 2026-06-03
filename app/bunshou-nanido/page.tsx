import type { Metadata } from "next";
import ToolPage from "@/tools/bunshou-nanido/page";

export const metadata: Metadata = {
  title: "文章難易度判定ツール",
  description: "文章の漢字含有率・平均文長・文字数から可読性スコアを算出。小学生〜専門書レベルを判定。無料ツール。",
  alternates: { canonical: "https://tools.loresync.dev/bunshou-nanido" },
};

export default function Page() {
  return <ToolPage />;
}
