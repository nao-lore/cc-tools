"use client";
import NpsScore from "./components/NpsScore";
export default function NpsScorePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">NPS スコア計算ツール</h1>
        <p className="text-gray-600 mb-8">アンケート結果からNPSスコアと推奨者・中立者・批判者の分布を計算します</p>
        <NpsScore />
      </div>
    </div>
  );
}
