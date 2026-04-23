"use client";
import Co2Travel from "./components/Co2Travel";
export default function Co2TravelPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">移動CO2排出量 計算</h1>
        <p className="text-gray-600 mb-8">距離と交通手段から移動に伴うCO2排出量を算出</p>
        <Co2Travel />
      </div>
    </div>
  );
}
