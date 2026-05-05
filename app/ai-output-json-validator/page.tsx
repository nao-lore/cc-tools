import type { Metadata } from "next";
import ToolPage from "@/tools/ai-output-json-validator/page";

export const metadata: Metadata = {
  title: "AI出力 JSON整形・検証ツール",
  description: "LLMが返した崩れたJSONを自動修復。スキーマ定義との差分表示。AI開発者向け。無料ツール。",
  alternates: { canonical: "https://tools.loresync.dev/ai-output-json-validator" },
};

export default function Page() {
  return <ToolPage />;
}
