"use client";
import ZangyouDai from "./components/ZangyouDai";

export default function ZangyouDaiPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f0a1a] via-[#1a1030] to-[#0d0d2b] py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-2">残業代 計算機</h1>
        <p className="text-violet-100 mb-8">法定時間外・深夜・休日・月60時間超を区分して正確に計算</p>
        <ZangyouDai />
      </div>
    </div>
  );
}
