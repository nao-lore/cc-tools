"use client";
import EmbeddingCostCalculator from "./components/EmbeddingCostCalculator";

export default function EmbeddingCostCalculatorPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-cyan-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-teal-900 mb-2">埋め込みAPI 料金計算</h1>
        <p className="text-teal-700 mb-8">OpenAI / Cohere / Voyage / Google のEmbedding APIをドキュメント数・トークン数から比較</p>
        <EmbeddingCostCalculator />
      </div>
    </div>
  );
}
