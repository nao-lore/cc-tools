"use client";
import WaterTankVolume from "./components/WaterTankVolume";
export default function WaterTankVolumePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">水槽容量 計算ツール</h1>
        <p className="text-gray-600 mb-8">水槽サイズから水量・重量・推奨ヒーター・フィルタースペックを計算します</p>
        <WaterTankVolume />
      </div>
    </div>
  );
}
