"use client";
import OpenRouterPricing from "./components/OpenRouterPricing";

export default function OpenRouterPricingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f0a1a] via-[#1a1030] to-[#0d0d2b] py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-2">OpenRouter LLM料金比較</h1>
        <p className="text-violet-100 mb-8">主要LLMモデルのAPI料金・コンテキスト長を横断比較 — コスト試算・用途別おすすめ付き</p>
        <OpenRouterPricing />
      </div>
    </div>
  );
}
