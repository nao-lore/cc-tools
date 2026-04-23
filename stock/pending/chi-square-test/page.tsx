"use client";
import ChiSquareTest from "./components/ChiSquareTest";
export default function ChiSquareTestPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">カイ二乗検定 計算ツール</h1>
        <p className="text-gray-600 mb-8">観測値と期待値を入力してカイ二乗値・p値・有意差判定を計算します</p>
        <ChiSquareTest />
      </div>
    </div>
  );
}
