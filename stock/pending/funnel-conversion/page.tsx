"use client";
import FunnelConversion from "./components/FunnelConversion";
export default function FunnelConversionPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">ファネル コンバージョン率 計算ツール</h1>
        <p className="text-gray-600 mb-8">各ステップの流入数から離脱率・CVR・ボトルネックを分析します</p>
        <FunnelConversion />
      </div>
    </div>
  );
}
