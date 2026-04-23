"use client";
import GasFeeCalculator from "./components/GasFeeCalculator";
export default function GasFeeCalculatorPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Ethereum ガス代 円換算ツール</h1>
        <p className="text-gray-600 mb-8">Gas Price（Gwei）・ETH価格・取引タイプからガス代を日本円で試算</p>
        <GasFeeCalculator />
      </div>
    </div>
  );
}
