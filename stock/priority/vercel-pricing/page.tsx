"use client";
import VercelPricing from "./components/VercelPricing";

export default function VercelPricingPage() {
  return (
    <div className="min-h-screen bg-black py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <svg viewBox="0 0 76 65" className="h-6 w-6 fill-white" aria-label="Vercel">
              <path d="M37.5274 0L75.0548 65H0L37.5274 0Z" />
            </svg>
            <h1 className="text-2xl font-bold text-white">Vercel 料金試算</h1>
          </div>
          <p className="text-gray-500 text-sm">
            Hobby / Pro プランの月額料金をプラン・帯域幅・ビルド時間・関数実行から試算
          </p>
        </div>
        <VercelPricing />
      </div>
    </div>
  );
}
