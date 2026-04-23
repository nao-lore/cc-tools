"use client";
import DanmenkeiSei from "./components/DanmenkeiSei";
export default function DanmenkeiSeiPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">断面係数 計算（梁）</h1>
        <p className="text-gray-600 mb-8">梁の断面形状から断面係数・断面二次モーメントを算出</p>
        <DanmenkeiSei />
      </div>
    </div>
  );
}
