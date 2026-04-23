"use client";
import FocusStreakTracker from "./components/FocusStreakTracker";

export default function FocusStreakTrackerPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">集中ストリーク トラッカー</h1>
        <p className="text-gray-600 mb-8">連続集中日数を記録・可視化。中断率・平均集中時間の分析で習慣化をサポート。</p>
        <FocusStreakTracker />
      </div>
    </div>
  );
}
