"use client";
import RecipeScaling from "./components/RecipeScaling";

export default function RecipeScalingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          レシピ 分量スケーリング
        </h1>
        <p className="text-gray-600 mb-8">
          人数変更で材料分量を自動調整。大さじ・カップのグラム換算にも対応。
        </p>
        <RecipeScaling />
      </div>
    </div>
  );
}
