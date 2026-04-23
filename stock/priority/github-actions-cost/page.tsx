"use client";
import GithubActionsCost from "./components/GithubActionsCost";
export default function GithubActionsCostPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-slate-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">GitHub Actions 料金計算</h1>
        <p className="text-gray-600 mb-8">ランナー種別・実行時間・ストレージから月額コストをシミュレーション</p>
        <GithubActionsCost />
      </div>
    </div>
  );
}
