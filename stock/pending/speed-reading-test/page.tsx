"use client";
import SpeedReadingTest from "./components/SpeedReadingTest";

export default function SpeedReadingTestPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">速読速度 測定</h1>
        <p className="text-gray-600 mb-8">黙読速度を測定して学年別・年齢別平均と比較。理解度チェック付き。</p>
        <SpeedReadingTest />
      </div>
    </div>
  );
}
