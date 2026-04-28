import type { Metadata } from "next";
import ToolPage from "@/tools/azure-openai-cost/page";

export const metadata: Metadata = {
  title: "Azure OpenAI Service 料金計算 — リージョン別・デプロイ別コストシミュレーター",
  description: "Azure OpenAI Service（GPT-4o/GPT-4.1/o3）の料金をリージョン別に計算。PTU vs 従量課金の比較、月額シミュレーション付き。",
  alternates: { canonical: "https://tools.loresync.dev/azure-openai-cost" },
};

export default function Page() {
  return <ToolPage />;
}
