"use client";
import FxTravelBudget from "./components/FxTravelBudget";

export default function Page() {
  return (
    <div className="min-h-screen bg-slate-50 py-6 px-4">
      <div className="max-w-5xl mx-auto">
        <nav className="text-sm text-gray-500 mb-4">
          <a href="/" className="hover:text-gray-700">ツール一覧</a>
          <span className="mx-2">›</span>
          <span className="text-gray-900">海外旅行予算換算</span>
        </nav>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sm:p-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">海外旅行予算換算</h1>
          <p className="text-gray-500 mb-8">現地通貨・為替手数料・チップ込みで必要日本円を計算</p>
          <FxTravelBudget />
        </div>
      </div>
    </div>
  );
}
