"use client";
import GoshugiSouba from "./components/GoshugiSouba";

export default function GoshugiSoubaPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 to-pink-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          ご祝儀相場 計算
        </h1>
        <p className="text-gray-600 mb-8">
          続柄・年代・関係性・地域から結婚式のご祝儀金額を即判定。相場表とマナーガイド付き。
        </p>
        <GoshugiSouba />
      </div>
    </div>
  );
}
