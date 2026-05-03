"use client";
import AiCostCalculator from "./components/AiCostCalculator";

export default function AiCostCalculatorPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">AI API コスト計算</h1>
        <p className="text-gray-600 mb-8">ChatGPT / Claude / Gemini のAPI利用料金をリアルタイムで計算</p>
        <AiCostCalculator />
      </div>
    </div>
  );
}
