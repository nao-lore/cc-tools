"use client";
import ZangyouDai from "./components/ZangyouDai";

export default function ZangyouDaiPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-navy-50 to-blue-100 py-8 px-4" style={{ background: "linear-gradient(135deg, #eef2ff 0%, #dbeafe 100%)" }}>
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">残業代 計算機</h1>
        <p className="text-gray-600 mb-8">法定時間外・深夜・休日・月60時間超を区分して正確に計算</p>
        <ZangyouDai />
      </div>
    </div>
  );
}
