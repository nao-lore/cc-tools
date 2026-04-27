"use client";
import TeigakuGenzei from "./components/TeigakuGenzei";

export default function TeigakuGenzeiPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-rose-100 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">定額減税 計算機</h1>
        <p className="text-gray-600 mb-8">2024〜2025年の定額減税（所得税3万円＋住民税1万円）の適用額をシミュレーション</p>
        <TeigakuGenzei />
      </div>
    </div>
  );
}
