"use client";
import WineAgingCalculator from "./components/WineAgingCalculator";
export default function WineAgingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">ワイン飲み頃判定</h1>
        <p className="text-gray-600 mb-8">品種・産地・ヴィンテージ・保管条件から最適な飲み頃時期を予測</p>
        <WineAgingCalculator />
      </div>
    </div>
  );
}
