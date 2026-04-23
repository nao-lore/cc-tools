"use client";
import ProcrastinationCost from "./components/ProcrastinationCost";

export default function ProcrastinationCostPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">先延ばし コスト計算</h1>
        <p className="text-gray-600 mb-8">タスク先延ばしの時間的・金銭的コストをリアルタイムで可視化。行動を後押し。</p>
        <ProcrastinationCost />
      </div>
    </div>
  );
}
