"use client";
import RenderFlyRailway from "./components/RenderFlyRailway";

export default function RenderFlyRailwayPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f0a1a] via-[#1a1030] to-[#0d0d2b] py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-2">
          Render / Fly.io / Railway 料金比較
        </h1>
        <p className="text-violet-100 mb-8">
          個人開発者向けPaaS 3社の料金・リソース・リージョンを横断比較
        </p>
        <RenderFlyRailway />
      </div>
    </div>
  );
}
