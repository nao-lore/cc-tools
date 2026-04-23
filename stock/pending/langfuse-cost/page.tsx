"use client";
import LangfuseCost from "./components/LangfuseCost";
export default function LangfuseCostPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">LLM監視・オブザーバビリティツール 料金比較</h1>
        <p className="text-gray-600 mb-8">Langfuse・LangSmith・Helicone等の料金プランを比較します</p>
        <LangfuseCost />
      </div>
    </div>
  );
}
