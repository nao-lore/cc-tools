"use client";
import RerankModelComparison from "./components/RerankModelComparison";
export default function RerankModelCmpPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Rerankモデル比較</h1>
        <p className="text-gray-600 mb-8">Cohere / Voyage / Jina 等のリランキングAPI料金・性能を横断比較</p>
        <RerankModelComparison />
      </div>
    </div>
  );
}
