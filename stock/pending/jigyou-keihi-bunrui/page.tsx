"use client";
import JigyouKeihiBunrui from "./components/JigyouKeihiBunrui";

export default function JigyouKeihiBunruiPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f0a1a] via-[#1a1030] to-[#0d0d2b] py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-2">経費→勘定科目 分類ツール</h1>
        <p className="text-violet-100 mb-8">摘要テキストから勘定科目をルールベースで即判定。フリーランス・個人事業主向け。</p>
        <JigyouKeihiBunrui />
      </div>
    </div>
  );
}
