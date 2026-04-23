"use client";
import StableDiffusionCost from "./components/StableDiffusionCost";
export default function StableDiffusionCostPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Stable Diffusion API 料金比較</h1>
        <p className="text-gray-600 mb-8">Replicate・Stability AI・fal.ai の画像生成コストを比較して最安プロバイダーを探そう</p>
        <StableDiffusionCost />
      </div>
    </div>
  );
}
