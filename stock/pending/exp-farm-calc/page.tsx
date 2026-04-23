"use client";
import ExpFarmCalc from "./components/ExpFarmCalc";
export default function ExpFarmCalcPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">経験値効率計算</h1>
        <p className="text-gray-600 mb-8">ゲームの経験値効率を時間・ドロップ率から計算して最適な周回先を比較します</p>
        <ExpFarmCalc />
      </div>
    </div>
  );
}
