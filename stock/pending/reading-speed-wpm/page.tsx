"use client";
import ReadingSpeedWpm from "./components/ReadingSpeedWpm";

export default function ReadingSpeedWpmPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">読書速度 WPM 計測</h1>
        <p className="text-gray-600 mb-8">文章を読んで読書速度（文字/分）を測定。日本人平均と比較して読了時間を予測。</p>
        <ReadingSpeedWpm />
      </div>
    </div>
  );
}
