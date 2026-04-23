"use client";
import StudySchedule from "./components/StudySchedule";
export default function StudySchedulePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">試験日逆算 学習スケジュール自動生成</h1>
        <p className="text-gray-600 mb-8">試験日・科目・勉強時間から最適な学習計画を自動生成します</p>
        <StudySchedule />
      </div>
    </div>
  );
}
