"use client";
import KajiAnbun from "./components/KajiAnbun";

export default function KajiAnbunPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-100 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">家事按分 計算</h1>
        <p className="text-gray-600 mb-8">家賃・光熱費・通信費を事業割合で按分。在宅フリーランスの確定申告に必要な経費を即計算</p>
        <KajiAnbun />
      </div>
    </div>
  );
}
