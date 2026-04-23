"use client";
import MeetingCost from "./components/MeetingCost";

export default function MeetingCostPage() {
  return (
    <div className="min-h-screen py-8 px-4" style={{ background: "linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)" }}>
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-2">会議コスト計算機</h1>
        <p className="text-slate-400 mb-8">参加者の年収・人数・時間から会議の値段をリアルタイムで可視化</p>
        <MeetingCost />
      </div>
    </div>
  );
}
