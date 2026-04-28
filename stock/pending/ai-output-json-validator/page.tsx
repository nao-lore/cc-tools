"use client";
import AiOutputJsonValidator from "./components/AiOutputJsonValidator";

export default function AiOutputJsonValidatorPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f0a1a] via-[#1a1030] to-[#0d0d2b] py-8 px-4">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-2">AI出力 JSON整形・検証ツール</h1>
        <p className="text-violet-100 mb-8">LLMが返した崩れたJSONを自動修復。スキーマ定義との差分を表示。</p>
        <AiOutputJsonValidator />
      </div>
    </div>
  );
}
