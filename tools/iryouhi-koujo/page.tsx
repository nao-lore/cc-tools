"use client";
import IryouhiKoujo from "./components/IryouhiKoujo";

export default function IryouhiKoujoPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-100 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">医療費控除 シミュレーター</h1>
        <p className="text-gray-600 mb-8">年間医療費・保険補填額・所得金額から控除額と還付見込み額を計算</p>
        <IryouhiKoujo />
      </div>
    </div>
  );
}
