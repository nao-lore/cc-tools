"use client";
import TemperatureTopPTester from "./components/TemperatureTopPTester";
export default function TemperatureTopPTesterPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">LLM Temperature / Top-p 比較実験</h1>
        <p className="text-gray-600 mb-8">サンプリングパラメータの効果をビジュアルで理解する</p>
        <TemperatureTopPTester />
      </div>
    </div>
  );
}
