"use client";
import WordLevelJudge from "./components/WordLevelJudge";
export default function WordLevelJudgePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">英単語 CEFRレベル判定ツール</h1>
        <p className="text-gray-600 mb-8">英単語のCEFRレベル（A1〜C2）と頻出度を判定します</p>
        <WordLevelJudge />
      </div>
    </div>
  );
}
