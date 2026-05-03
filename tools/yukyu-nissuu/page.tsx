"use client";
import YukyuNissuu from "./components/YukyuNissuu";

export default function YukyuNissuuPage() {
  return (
    <div
      className="min-h-screen py-8 px-4"
      style={{ background: "linear-gradient(135deg, #0f172a 0%, #1e3a5f 50%, #1e40af 100%)" }}
    >
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-2">有給休暇 付与日数計算</h1>
        <p className="text-blue-200 mb-8">勤続年数・週所定労働日数から法定付与日数を即計算</p>
        <YukyuNissuu />
      </div>
    </div>
  );
}
