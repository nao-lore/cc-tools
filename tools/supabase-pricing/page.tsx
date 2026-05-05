"use client";
import SupabasePricing from "./components/SupabasePricing";

export default function SupabasePricingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-emerald-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Supabase 料金試算</h1>
        <p className="text-gray-600 mb-8">Free / Pro / Team の月額コストをシミュレーション</p>
        <SupabasePricing />
      </div>
    </div>
  );
}
