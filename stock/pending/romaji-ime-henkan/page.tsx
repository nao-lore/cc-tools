"use client";
import RomajiImeHenkan from "./components/RomajiImeHenkan";
export default function RomajiImeHenkanPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">ローマ字 ↔ ひらがな 変換</h1>
        <p className="text-gray-600 mb-8">ローマ字入力をひらがなに変換、ひらがなをローマ字に逆変換します</p>
        <RomajiImeHenkan />
      </div>
    </div>
  );
}
