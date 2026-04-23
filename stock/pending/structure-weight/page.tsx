"use client";
import StructureWeight from "./components/StructureWeight";
export default function StructureWeightPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">構造 荷重 簡易計算</h1>
        <p className="text-gray-600 mb-8">積載荷重・固定荷重・積雪荷重を合算して設計荷重を算出</p>
        <StructureWeight />
      </div>
    </div>
  );
}
