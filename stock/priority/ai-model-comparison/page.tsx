"use client";
import AiModelComparison from "./components/AiModelComparison";

export default function AiModelComparisonPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">AIモデル比較表</h1>
        <p className="text-gray-600 mb-8">ChatGPT / Claude / Gemini — 料金・コンテキスト長・性能を一覧比較</p>
        <AiModelComparison />
      </div>
    </div>
  );
}
