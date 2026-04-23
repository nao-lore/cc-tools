"use client";
import FpsInputLagCalculator from "./components/FpsInputLagCalculator";
export default function FpsInputLagPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">FPSインプットラグ計算</h1>
        <p className="text-gray-600 mb-8">リフレッシュレート・応答時間・GPU遅延から総インプットラグを算出</p>
        <FpsInputLagCalculator />
      </div>
    </div>
  );
}
