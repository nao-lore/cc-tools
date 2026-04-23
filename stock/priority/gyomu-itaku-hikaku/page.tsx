"use client";
import GyomuItakuHikaku from "./components/GyomuItakuHikaku";

export default function GyomuItakuHikakuPage() {
  return (
    <div className="min-h-screen py-8 px-4" style={{ background: "linear-gradient(135deg, #eff6ff 0%, #e0f2fe 50%, #f0f9ff 100%)" }}>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">業務委託 vs 正社員 手取り比較</h1>
        <p className="text-gray-600 mb-8">同じ額面年収で手取り・社会保険・将来年金がどう変わるかを即比較</p>
        <GyomuItakuHikaku />
      </div>
    </div>
  );
}
