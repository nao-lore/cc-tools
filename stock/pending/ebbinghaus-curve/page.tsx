"use client";
import EbbinghausCurve from "./components/EbbinghausCurve";
export default function EbbinghausCurvePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">エビングハウス忘却曲線 復習スケジューラー</h1>
        <p className="text-gray-600 mb-8">忘却曲線に基づいた最適な復習スケジュールを自動生成します</p>
        <EbbinghausCurve />
      </div>
    </div>
  );
}
