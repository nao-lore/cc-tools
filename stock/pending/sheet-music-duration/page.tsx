"use client";
import SheetMusicDuration from "./components/SheetMusicDuration";

export default function SheetMusicDurationPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">楽譜演奏時間計算</h1>
        <p className="text-gray-600 mb-8">BPM・小節数・拍子から演奏時間を自動計算。繰り返し・テンポ変化にも対応。</p>
        <SheetMusicDuration />
      </div>
    </div>
  );
}
