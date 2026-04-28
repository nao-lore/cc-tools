"use client";
import GachaProbability from "./components/GachaProbability";

export default function GachaProbabilityPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f0a1a] via-[#1a1030] to-[#0d0d2b] py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-1 text-white">
          ガチャ確率 計算
        </h1>
        <p className="text-center text-violet-100 mb-8 text-sm">
          排出率と試行回数から当選確率を即計算
        </p>
        <GachaProbability />
      </div>
    </div>
  );
}
