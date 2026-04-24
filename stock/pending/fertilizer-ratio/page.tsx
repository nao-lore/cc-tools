"use client";
import FertilizerRatio from "./components/FertilizerRatio";

export default function Page() {
  return (
    <div className="min-h-screen bg-slate-50 py-6 px-4">
      <div className="max-w-5xl mx-auto">
        <nav className="text-sm text-gray-500 mb-4">
          <a href="/" className="hover:text-gray-700">ツール一覧</a>
          <span className="mx-2">›</span>
          <span className="text-gray-900">肥料 NPK配合計算</span>
        </nav>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sm:p-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">肥料 NPK配合計算</h1>
          <p className="text-gray-500 mb-8">窒素・リン酸・カリの必要量から肥料の配合量を計算</p>
          <FertilizerRatio />
        </div>
      </div>
    </div>
  );
}
