"use client";
import StakingYieldCalculator from "./components/StakingYieldCalculator";
export default function StakingYieldPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">ステーキング利回り計算</h1>
        <p className="text-gray-600 mb-8">PoS通貨の年利・複利・税引後リターンをシミュレーション</p>
        <StakingYieldCalculator />
      </div>
    </div>
  );
}
