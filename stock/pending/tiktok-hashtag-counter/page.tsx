"use client";
import TiktokHashtagCounter from "./components/TiktokHashtagCounter";

export default function TiktokHashtagCounterPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">TikTok ハッシュタグ文字数管理</h1>
        <p className="text-gray-600 mb-8">キャプション＋ハッシュタグの150字制限をリアルタイムチェック。投稿前の確認に。</p>
        <TiktokHashtagCounter />
      </div>
    </div>
  );
}
