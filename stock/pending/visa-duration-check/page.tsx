"use client";
import VisaDurationCheck from "./components/VisaDurationCheck";
export default function VisaDurationCheckPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">ビザ滞在日数計算</h1>
        <p className="text-gray-600 mb-8">入国日・出国日からビザ滞在日数と残日数を計算します</p>
        <VisaDurationCheck />
      </div>
    </div>
  );
}
