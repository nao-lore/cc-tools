"use client";
import EtoHantei from "./components/EtoHantei";
export default function EtoHanteiPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">干支 / 十二支 判定</h1>
        <p className="text-gray-600 mb-8">生年から干支・十干十二支（六十干支）を判定します。</p>
        <EtoHantei />
      </div>
    </div>
  );
}
