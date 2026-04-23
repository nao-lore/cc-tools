"use client";
import WithholdingTaxCalculator from "./components/WithholdingTaxCalculator";

export default function WithholdingTaxCalculatorPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-100 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">源泉徴収税 計算</h1>
        <p className="text-gray-600 mb-8">フリーランス・個人事業主への報酬にかかる源泉徴収税額を計算</p>
        <WithholdingTaxCalculator />
      </div>
    </div>
  );
}
