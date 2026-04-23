"use client";
import DeepWorkCalculator from "./components/DeepWorkCalculator";
export default function DeepWorkCalculatorPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">ディープワーク時間計画</h1>
        <p className="text-gray-600 mb-8">1週間の予定から確保可能な集中作業時間を計算して最適化します</p>
        <DeepWorkCalculator />
      </div>
    </div>
  );
}
