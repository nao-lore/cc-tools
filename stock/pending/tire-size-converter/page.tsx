"use client";
import TireSizeConverter from "./components/TireSizeConverter";
export default function TireSizeConverterPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">タイヤサイズ互換変換</h1>
        <p className="text-gray-600 mb-8">タイヤサイズ表記の互換サイズと外径差・速度誤差を計算します</p>
        <TireSizeConverter />
      </div>
    </div>
  );
}
