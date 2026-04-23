"use client";
import ClaudeApiCost from "./components/ClaudeApiCost";
export default function ClaudeApiCostPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Claude API コスト計算</h1>
        <p className="text-gray-600 mb-8">Anthropic Claude API（Opus / Sonnet / Haiku）の料金をリアルタイムで計算</p>
        <ClaudeApiCost />
      </div>
    </div>
  );
}
