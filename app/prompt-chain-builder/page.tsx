import type { Metadata } from "next";
import ToolPage from "@/tools/prompt-chain-builder/page";

export const metadata: Metadata = {
  title: "プロンプトチェーン設計ツール",
  description: "複数ステップのプロンプトを視覚的に連結。入出力の依存関係を可視化。チェーン全体のトークン数も計算。無料ツール。",
  alternates: { canonical: "https://tools.loresync.dev/prompt-chain-builder" },
};

export default function Page() {
  return <ToolPage />;
}
