"use client";
import GachaProbability from "./components/GachaProbability";

export default function GachaProbabilityPage() {
  return (
    <div className="min-h-screen bg-gray-950 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-1" style={{ color: "#a78bfa" }}>
          ガチャ確率 計算
        </h1>
        <p className="text-center text-gray-400 mb-8 text-sm">
          排出率と試行回数から当選確率を即計算
        </p>
        <GachaProbability />
      </div>
    </div>
  );
}
