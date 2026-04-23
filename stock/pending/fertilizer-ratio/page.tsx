"use client";
import FertilizerRatio from "./components/FertilizerRatio";
export default function FertilizerRatioPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">肥料 NPK配合 計算ツール</h1>
        <p className="text-gray-600 mb-8">目標NPK量と肥料の成分から必要な配合量を計算します</p>
        <FertilizerRatio />
      </div>
    </div>
  );
}
