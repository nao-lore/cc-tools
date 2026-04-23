"use client";
import Co2Aquarium from "./components/Co2Aquarium";
export default function Co2AquariumPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">水槽CO2添加 計算</h1>
        <p className="text-gray-600 mb-8">KH・pH値から水槽内CO2濃度と最適添加量を算出</p>
        <Co2Aquarium />
      </div>
    </div>
  );
}
