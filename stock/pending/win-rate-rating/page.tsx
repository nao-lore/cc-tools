"use client";
import WinRateRating from "./components/WinRateRating";
export default function WinRateRatingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">勝率 → Eloレート 計算ツール</h1>
        <p className="text-gray-600 mb-8">対戦ゲームの勝率からEloレート変動を予測します</p>
        <WinRateRating />
      </div>
    </div>
  );
}
