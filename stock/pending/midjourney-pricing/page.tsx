"use client";
import MidjourneyPricing from "./components/MidjourneyPricing";
export default function MidjourneyPricingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Midjourney 料金シミュレーター</h1>
        <p className="text-gray-600 mb-8">プラン別の生成枚数・Fast時間・Relaxedモードを比較して最適プランを選ぼう</p>
        <MidjourneyPricing />
      </div>
    </div>
  );
}
