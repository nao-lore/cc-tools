"use client";
import AojiroShinkokuSim from "./components/AojiroShinkokuSim";

export default function AojiroShinkokuSimPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">青色申告 節税シミュレーター</h1>
        <p className="text-gray-600 mb-8">65万/55万/10万円控除の節税効果を白色申告と比較して即計算</p>
        <AojiroShinkokuSim />
      </div>
    </div>
  );
}
