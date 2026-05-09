"use client";
import ZeiKinHenkan from "./components/ZeiKinHenkan";

export default function ZeiKinHenkanPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f0a1a] via-[#1a1030] to-[#0d0d2b] py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-2">税込 ⇔ 税抜 一括変換</h1>
        <p className="text-violet-100 mb-8">8%/10%軽減税率対応・レシート複数行一括計算・内税外税両対応</p>
        <ZeiKinHenkan />
      </div>
    </div>
  );
}
