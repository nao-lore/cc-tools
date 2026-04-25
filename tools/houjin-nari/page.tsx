"use client";
import HoujinNari from "./components/HoujinNari";

export default function HoujinNariPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-navy-900 to-slate-800 py-8 px-4" style={{background: "linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)"}}>
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-2">法人成り シミュレーター</h1>
        <p className="text-slate-400 mb-8">個人事業主 vs 法人（1人社長）の手取り・税金・社会保険を比較して損益分岐点を判定</p>
        <HoujinNari />
      </div>
    </div>
  );
}
