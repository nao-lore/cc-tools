import type { Metadata } from "next";
import ToolPage from "@/tools/rag-cost-estimator/page";

export const metadata: Metadata = {
  title: "RAG運用コスト計算 — 埋め込み・ベクトルDB・LLM推論の月額試算",
  description: "RAG（検索拡張生成）の月額運用コストを試算。Embedding・ベクトルDB・LLM推論の3層で計算。OpenAI/Pinecone/Weaviate等の料金対応。",
  alternates: { canonical: "https://tools.loresync.dev/rag-cost-estimator" },
};

export default function Page() {
  return <ToolPage />;
}
