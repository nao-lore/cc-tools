"use client";
import PromptChainBuilder from "./components/PromptChainBuilder";

export default function PromptChainBuilderPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f0a1a] via-[#1a1030] to-[#0d0d2b] py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-2">プロンプトチェーン設計ツール</h1>
        <p className="text-violet-100 mb-8">複数ステップのLLM呼び出しを視覚的に設計・連結。JSONエクスポートでAPI実装に直結。</p>
        <PromptChainBuilder />
      </div>
    </div>
  );
}
