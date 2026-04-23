"use client";
import InstagramCarouselPlanner from "./components/InstagramCarouselPlanner";
export default function InstagramCarouselPlannerPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Instagram カルーセル 順序設計</h1>
        <p className="text-gray-600 mb-8">カルーセル投稿の枚数・各スライドの内容フローを設計。ジャンル別テンプレート・フック文・CTA提案付き。</p>
        <InstagramCarouselPlanner />
      </div>
    </div>
  );
}
