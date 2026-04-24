"use client";
import ConsumptionTaxChoice from "./components/ConsumptionTaxChoice";

export default function ConsumptionTaxChoicePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-amber-900 mb-2">簡易課税 vs 本則課税 判定</h1>
        <p className="text-amber-700 mb-8">売上・仕入・業種から最も有利な消費税の課税方式を即判定。2割特例も比較</p>
        <ConsumptionTaxChoice />
      </div>
    </div>
  );
}
