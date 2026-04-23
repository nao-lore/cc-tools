"use client";
import IdecoTaxSaving from "./components/IdecoTaxSaving";

export default function IdecoTaxSavingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-emerald-100 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">iDeCo 節税額シミュレーター</h1>
        <p className="text-gray-600 mb-8">掛金・年収・職業から所得税＋住民税の節税効果を計算</p>
        <IdecoTaxSaving />
      </div>
    </div>
  );
}
