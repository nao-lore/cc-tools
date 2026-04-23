"use client";
import ConfidenceInterval from "./components/ConfidenceInterval";
export default function ConfidenceIntervalPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">信頼区間 計算ツール</h1>
        <p className="text-gray-600 mb-8">サンプルサイズ・平均・標準偏差から信頼区間を計算します</p>
        <ConfidenceInterval />
      </div>
    </div>
  );
}
