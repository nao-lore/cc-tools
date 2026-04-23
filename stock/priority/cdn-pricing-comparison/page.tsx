"use client";
import CdnPricingComparison from "./components/CdnPricingComparison";

export default function CdnPricingComparisonPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-slate-100 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          CDN 料金比較
        </h1>
        <p className="text-gray-600 mb-8">
          Cloudflare / CloudFront / Fastly / BunnyCDN — 月間トラフィック量・リージョンから最安CDNを判定
        </p>
        <CdnPricingComparison />
      </div>
    </div>
  );
}
