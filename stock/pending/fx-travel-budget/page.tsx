"use client";
import FxTravelBudget from "./components/FxTravelBudget";

export default function FxTravelBudgetPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">海外旅行 予算換算</h1>
        <p className="text-gray-600 mb-8">現地通貨・為替手数料・チップ込みで必要な日本円を計算。旅費見積もりに。</p>
        <FxTravelBudget />
      </div>
    </div>
  );
}
