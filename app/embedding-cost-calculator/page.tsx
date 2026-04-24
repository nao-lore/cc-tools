import type { Metadata } from "next";
import ToolPage from "@/tools/embedding-cost-calculator/page";

export const metadata: Metadata = {
  title: "Embedding API 料金計算 — OpenAI / Cohere / Voyage 料金比較",
  description: "Embedding APIの料金をプロバイダー別に比較。OpenAI text-embedding-3、Cohere embed-v3、Voyage-3、Gemini Embedding等の料金をドキュメント数から即計算。",
  alternates: { canonical: "https://tools.loresync.dev/embedding-cost-calculator" },
};

export default function Page() {
  return <ToolPage />;
}
