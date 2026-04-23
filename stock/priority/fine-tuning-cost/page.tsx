"use client";
import FineTuningCost from "./components/FineTuningCost";
export default function FineTuningCostPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">ファインチューニング 料金計算</h1>
        <p className="text-gray-600 mb-8">GPT-4o mini / GPT-4.1 mini / GPT-4o のファインチューニング学習コスト＋推論コストを試算</p>
        <FineTuningCost />
      </div>
    </div>
  );
}
