"use client";
import WhisperApiCost from "./components/WhisperApiCost";
export default function WhisperApiCostPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-cyan-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Whisper API 料金計算</h1>
        <p className="text-gray-600 mb-8">OpenAI Whisper API の音声文字起こしコストを時間・ファイル数からリアルタイム計算</p>
        <WhisperApiCost />
      </div>
    </div>
  );
}
