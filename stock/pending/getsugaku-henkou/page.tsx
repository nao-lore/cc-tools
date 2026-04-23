"use client";
import GetsugakuHenkou from "./components/GetsugakuHenkou";
export default function GetsugakuHenkouPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">月額変更届（随時改定）判定 計算ツール</h1>
        <p className="text-gray-600 mb-8">固定的賃金の変動で月変に該当するか判定し新標準報酬月額を算出します</p>
        <GetsugakuHenkou />
      </div>
    </div>
  );
}
