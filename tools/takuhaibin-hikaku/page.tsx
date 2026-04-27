"use client";
import TakuhaibinHikaku from "./components/TakuhaibinHikaku";

export default function TakuhaibinHikakuPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">宅配便 送料比較</h1>
        <p className="text-gray-600 mb-8">
          ヤマト運輸・佐川急便・日本郵便の送料を即比較。最安の配送方法を判定します。
        </p>
        <TakuhaibinHikaku />
      </div>
    </div>
  );
}
