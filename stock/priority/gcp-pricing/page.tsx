"use client";
import GcpPricing from "./components/GcpPricing";

export default function GcpPricingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-sky-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-3xl">☁️</span>
          <h1 className="text-3xl font-bold text-gray-900">Google Cloud 料金試算</h1>
        </div>
        <p className="text-gray-600 mb-8">Compute Engine / Cloud Run / Cloud Storage の月額コストをシミュレーション</p>
        <GcpPricing />
      </div>
    </div>
  );
}
