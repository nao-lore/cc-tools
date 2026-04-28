"use client";
import ZipToAddress from "./components/ZipToAddress";

export default function ZipToAddressPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f0a1a] via-[#1a1030] to-[#0d0d2b] py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-2">郵便番号→住所変換</h1>
        <p className="text-violet-100 mb-8">7桁の郵便番号から都道府県を即時判定。一括変換・コピー機能付き。</p>
        <ZipToAddress />
      </div>
    </div>
  );
}
