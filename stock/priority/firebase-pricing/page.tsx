"use client";
import FirebasePricing from "./components/FirebasePricing";

export default function FirebasePricingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-3xl">🔥</span>
          <h1 className="text-3xl font-bold text-gray-900">Firebase 料金試算</h1>
        </div>
        <p className="text-gray-600 mb-8">Spark（無料）/ Blaze（従量課金）の月額コストをシミュレーション</p>
        <FirebasePricing />
      </div>
    </div>
  );
}
