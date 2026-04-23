"use client";
import DigitalOceanPricing from "./components/DigitalOceanPricing";
export default function DigitalOceanPricingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">DigitalOcean Droplet 料金試算ツール</h1>
        <p className="text-gray-600 mb-8">Droplet・Spaces・Managed DBの組み合わせ月額を試算</p>
        <DigitalOceanPricing />
      </div>
    </div>
  );
}
