"use client";
import GeminiApiCost from "./components/GeminiApiCost";

export default function GeminiApiCostPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Gemini API コスト計算</h1>
        <p className="text-gray-600 mb-8">Google Gemini API（Pro / Flash）の料金をリアルタイムで計算</p>
        <GeminiApiCost />
      </div>
    </div>
  );
}
