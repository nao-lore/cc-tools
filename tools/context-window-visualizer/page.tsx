"use client";
import ContextWindowVisualizer from "./components/ContextWindowVisualizer";

export default function ContextWindowVisualizerPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-violet-100 py-8 px-4">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold text-indigo-900 mb-2">
          LLMコンテキストウィンドウ比較
        </h1>
        <p className="text-indigo-600 mb-8">
          GPT / Claude / Gemini — 文脈長をトークン・文字数・ページ数で可視化
        </p>
        <ContextWindowVisualizer />
      </div>
    </div>
  );
}
