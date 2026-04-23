"use client";
import SanteiKisoTodoke from "./components/SanteiKisoTodoke";
export default function SanteiKisoTodokePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">算定基礎届 標準報酬月額 計算ツール</h1>
        <p className="text-gray-600 mb-8">4〜6月の報酬から標準報酬月額を判定し社会保険料を試算します</p>
        <SanteiKisoTodoke />
      </div>
    </div>
  );
}
