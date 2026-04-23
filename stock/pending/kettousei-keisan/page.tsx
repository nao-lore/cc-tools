"use client";
import KettouseiKeisan from "./components/KettouseiKeisan";
export default function KettouseiKeisanPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">決算期 届出・申告期限 逆算ツール</h1>
        <p className="text-gray-600 mb-8">決算月から法人税・消費税申告期限と税務スケジュールを自動計算します</p>
        <KettouseiKeisan />
      </div>
    </div>
  );
}
