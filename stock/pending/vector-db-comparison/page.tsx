"use client";
import VectorDbComparison from "./components/VectorDbComparison";
export default function VectorDbComparisonPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">ベクトルDB 料金・機能比較ツール</h1>
        <p className="text-gray-600 mb-8">Pinecone・Weaviate・Qdrant・Chromaを料金・性能・機能で比較</p>
        <VectorDbComparison />
      </div>
    </div>
  );
}
