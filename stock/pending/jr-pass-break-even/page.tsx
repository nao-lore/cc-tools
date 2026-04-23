"use client";
import JrPassBreakEven from "./components/JrPassBreakEven";
export default function JrPassBreakEvenPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">JRパス損益分岐計算</h1>
        <p className="text-gray-600 mb-8">ルート別の運賃合計とJRパス料金を比較して、元が取れるか判定します</p>
        <JrPassBreakEven />
      </div>
    </div>
  );
}
