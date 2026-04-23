"use client";
import AnovaCalc from "./components/AnovaCalc";
export default function AnovaCalcPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">一元配置分散分析（ANOVA）</h1>
        <p className="text-gray-600 mb-8">3群以上のデータに対してF値・p値・効果量η²を計算</p>
        <AnovaCalc />
      </div>
    </div>
  );
}
