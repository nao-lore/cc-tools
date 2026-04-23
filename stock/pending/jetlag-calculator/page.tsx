"use client";
import JetlagCalculator from "./components/JetlagCalculator";
export default function JetlagCalculatorPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">時差ボケ調整計画</h1>
        <p className="text-gray-600 mb-8">出発地・到着地の時差から体内時計の調整スケジュールを自動生成します</p>
        <JetlagCalculator />
      </div>
    </div>
  );
}
