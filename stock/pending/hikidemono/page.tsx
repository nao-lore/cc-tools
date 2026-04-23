"use client";
import Hikidemono from "./components/Hikidemono";
export default function HikidemonoPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">引き出物 予算配分 計算</h1>
        <p className="text-gray-600 mb-8">ご祝儀額に対する引き出物の適切な予算を計算。料理・引き菓子・縁起物の内訳も提案します。</p>
        <Hikidemono />
      </div>
    </div>
  );
}
