"use client";
import StripeFeeCalculator from "./components/StripeFeeCalculator";

export default function StripeFeeCalculatorPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-100 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Stripe 手数料計算</h1>
        <p className="text-gray-600 mb-8">カード・コンビニ・銀行振込など決済方法別の手数料と実収入を即計算</p>
        <StripeFeeCalculator />
      </div>
    </div>
  );
}
