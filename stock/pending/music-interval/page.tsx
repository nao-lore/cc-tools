"use client";
import MusicInterval from "./components/MusicInterval";
export default function MusicIntervalPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">音名・音程・周波数 計算ツール</h1>
        <p className="text-gray-600 mb-8">音名から周波数、セント値、音程を相互計算します</p>
        <MusicInterval />
      </div>
    </div>
  );
}
