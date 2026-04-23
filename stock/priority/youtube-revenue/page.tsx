"use client";
import YoutubeRevenue from "./components/YoutubeRevenue";

export default function YoutubeRevenuePage() {
  return (
    <div className="min-h-screen py-8 px-4" style={{ background: "linear-gradient(135deg, #fff5f5 0%, #ffe4e4 100%)" }}>
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">YouTube 収益シミュレーター</h1>
        <p className="text-gray-600 mb-8">再生回数・RPMから広告収益を計算。Super Chat・メンバーシップ・案件収入も加算</p>
        <YoutubeRevenue />
      </div>
    </div>
  );
}
