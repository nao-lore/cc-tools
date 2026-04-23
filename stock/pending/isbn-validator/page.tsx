"use client";
import IsbnValidator from "./components/IsbnValidator";
export default function IsbnValidatorPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">ISBN / JANコード バリデーション・変換</h1>
        <p className="text-gray-600 mb-8">ISBN-10・ISBN-13・JANコードの検証とフォーマット変換。チェックディジットの計算過程を表示します。</p>
        <IsbnValidator />
      </div>
    </div>
  );
}
