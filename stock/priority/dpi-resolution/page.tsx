"use client";
import DpiResolution from "./components/DpiResolution";

export default function DpiResolutionPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-purple-900 mb-2">DPI / 解像度 / 印刷サイズ計算</h1>
        <p className="text-purple-700 mb-8">ピクセル数↔印刷サイズの相互変換。プリセット用紙サイズ（A4/A3/名刺など）・推奨DPI対応</p>
        <DpiResolution />
      </div>
    </div>
  );
}
