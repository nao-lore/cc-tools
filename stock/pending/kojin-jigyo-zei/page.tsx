"use client";
import KojinJigyoZei from "./components/KojinJigyoZei";
export default function KojinJigyoZeiPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">個人事業税 計算ツール</h1>
        <p className="text-gray-600 mb-8">業種別税率と290万円控除を反映した個人事業税を正確に計算します</p>
        <KojinJigyoZei />
      </div>
    </div>
  );
}
