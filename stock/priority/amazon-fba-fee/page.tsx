"use client";
import AmazonFbaFee from "./components/AmazonFbaFee";

export default function AmazonFbaFeePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Amazon FBA 手数料計算
        </h1>
        <p className="text-gray-600 mb-8">
          販売価格・商品サイズ・カテゴリから販売手数料・配送代行手数料・保管料を計算し、実利益をシミュレーションします。
        </p>
        <AmazonFbaFee />
      </div>
    </div>
  );
}
