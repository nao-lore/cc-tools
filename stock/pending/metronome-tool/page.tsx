"use client";
import MetronomeTool from "./components/MetronomeTool";
export default function MetronomeToolPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">メトロノーム（ブラウザ版）</h1>
        <p className="text-gray-600 mb-8">BPM設定でクリック音を再生。拍子・強拍アクセント対応。楽器練習・音楽制作に。</p>
        <MetronomeTool />
      </div>
    </div>
  );
}
