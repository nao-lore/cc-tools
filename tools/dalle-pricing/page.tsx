"use client";
import DallePricing from "./components/DallePricing";

export default function DallePricingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">DALL-E 画像生成 料金計算</h1>
        <p className="text-gray-600 mb-8">解像度・品質・枚数から画像生成コストをシミュレーション</p>
        <DallePricing />
      </div>
    </div>
  );
}
