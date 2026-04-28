"use client";
import StripeFeeCalculator from "./components/StripeFeeCalculator";

export default function StripeFeeCalculatorPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f0a1a] via-[#1a1030] to-[#0d0d2b] py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-2">Stripe 手数料計算</h1>
        <p className="text-violet-100 mb-8">カード・コンビニ・銀行振込など決済方法別の手数料と実収入を即計算</p>
        <StripeFeeCalculator />
      </div>
    </div>
  );
}
