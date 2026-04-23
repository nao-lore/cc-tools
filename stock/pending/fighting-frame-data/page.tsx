"use client";
import FightingFrameData from "./components/FightingFrameData";
export default function FightingFrameDataPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">格ゲー フレームデータ計算</h1>
        <p className="text-gray-600 mb-8">発生・持続・硬直フレームから有利不利とガード反撃可否を判定</p>
        <FightingFrameData />
      </div>
    </div>
  );
}
