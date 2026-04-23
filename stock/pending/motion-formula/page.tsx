"use client";
import MotionFormula from "./components/MotionFormula";
export default function MotionFormulaPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">等加速度運動 計算ツール</h1>
        <p className="text-gray-600 mb-8">初速度・加速度・時間から変位・終速・平均速度を計算します</p>
        <MotionFormula />
      </div>
    </div>
  );
}
