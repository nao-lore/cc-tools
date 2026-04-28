"use client";
import FirebasePricing from "./components/FirebasePricing";

export default function FirebasePricingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f0a1a] via-[#1a1030] to-[#0d0d2b] py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-3xl">🔥</span>
          <h1 className="text-3xl font-bold text-white">Firebase 料金試算</h1>
        </div>
        <p className="text-violet-100 mb-8">Spark（無料）/ Blaze（従量課金）の月額コストをシミュレーション</p>
        <FirebasePricing />
      </div>
    </div>
  );
}
