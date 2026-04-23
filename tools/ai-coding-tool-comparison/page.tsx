"use client";
import AiCodingToolComparison from "./components/AiCodingToolComparison";

export default function AiCodingToolComparisonPage() {
  return (
    <div className="min-h-screen bg-gray-950 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-2">AIコーディングツール比較</h1>
        <p className="text-gray-400 mb-8">Cursor / GitHub Copilot / Windsurf / Claude Code — 料金・機能・対応モデルを一覧比較</p>
        <AiCodingToolComparison />
      </div>
    </div>
  );
}
