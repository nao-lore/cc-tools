"use client";
import YamoriHiryou from "./components/YamoriHiryou";
export default function YamoriHiryouPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">液肥 希釈倍率計算</h1>
        <p className="text-gray-600 mb-8">液肥を目標濃度に希釈するための水量・原液量を計算</p>
        <YamoriHiryou />
      </div>
    </div>
  );
}
