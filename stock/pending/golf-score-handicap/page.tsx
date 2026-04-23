"use client";
import GolfHandicapCalculator from "./components/GolfHandicapCalculator";
export default function GolfScoreHandicapPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">ゴルフハンディキャップ計算</h1>
        <p className="text-gray-600 mb-8">スコア履歴からUSGA方式でハンディキャップインデックスを算出</p>
        <GolfHandicapCalculator />
      </div>
    </div>
  );
}
