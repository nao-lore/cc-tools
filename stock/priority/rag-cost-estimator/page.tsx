"use client";
import RagCostEstimator from "./components/RagCostEstimator";

export default function RagCostEstimatorPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 to-indigo-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">RAG 運用コスト試算</h1>
        <p className="text-gray-600 mb-8">
          Embedding・ベクトルDB・LLM推論の3層コストを月額でシミュレーション
        </p>
        <RagCostEstimator />
      </div>
    </div>
  );
}
