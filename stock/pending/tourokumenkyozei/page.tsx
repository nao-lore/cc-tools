"use client";
import TourokumenkyoZei from "./components/TourokumenkyoZei";
export default function TourokumenkyoZeiPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">登録免許税 計算ツール（不動産登記）</h1>
        <p className="text-gray-600 mb-8">不動産登記の種類と評価額から登録免許税を自動計算します</p>
        <TourokumenkyoZei />
      </div>
    </div>
  );
}
