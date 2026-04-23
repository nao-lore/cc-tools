"use client";
import FramerateConverter from "./components/FramerateConverter";
export default function FramerateConverterPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">フレームレート 変換・計算ツール</h1>
        <p className="text-gray-600 mb-8">動画のフレームレート変換時の尺・フレーム数・タイムコードを計算</p>
        <FramerateConverter />
      </div>
    </div>
  );
}
