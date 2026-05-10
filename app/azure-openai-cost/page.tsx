import type { Metadata } from "next";
import ToolPage from "@/tools/azure-openai-cost/page";

export const metadata: Metadata = {
  title: "Azure OpenAI Service 料金計算 - GPT-5・GPT-4.1・GPT-4oの月額概算",
  description: "Azure OpenAI ServiceのAPI料金を、月間リクエスト数、入力・キャッシュ入力・出力トークン、為替レートから日本円で概算します。",
  alternates: { canonical: "https://tools.loresync.dev/azure-openai-cost" },
};

export default function Page() {
  return <ToolPage />;
}
