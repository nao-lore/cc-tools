"use client";
import FewShotBuilder from "./components/FewShotBuilder";
export default function FewShotBuilderPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Few-shot プロンプト ビルダー</h1>
        <p className="text-gray-600 mb-8">LLM用のfew-shotプロンプトを例文付きで簡単構築</p>
        <FewShotBuilder />
      </div>
    </div>
  );
}
