"use client";
import PromptTokenCounter from "./components/PromptTokenCounter";

export default function PromptTokenCounterPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-violet-50 py-8 px-4">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          プロンプト トークンカウンター
        </h1>
        <p className="text-gray-500 mb-8">
          テキストを貼り付けてAI各モデルのトークン数・API料金を即座に推定 — ChatGPT / Claude / Gemini 対応
        </p>
        <PromptTokenCounter />
      </div>
    </div>
  );
}
