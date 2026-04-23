"use client";
import CommuteVsRemote from "./components/CommuteVsRemote";
export default function CommuteVsRemotePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">通勤 vs 在宅勤務 コスト比較</h1>
        <p className="text-gray-600 mb-8">交通費・光熱費・時間コストから通勤と在宅の総コストを比較します</p>
        <CommuteVsRemote />
      </div>
    </div>
  );
}
