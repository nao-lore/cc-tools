"use client";
import ShoKigyoKyosai from "./components/ShoKigyoKyosai";

export default function ShoKigyoKyosaiPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">小規模企業共済 節税計算</h1>
        <p className="text-gray-600 mb-8">掛金の節税効果・累計グラフ・解約時手取りを一画面でシミュレーション</p>
        <ShoKigyoKyosai />
      </div>
    </div>
  );
}
