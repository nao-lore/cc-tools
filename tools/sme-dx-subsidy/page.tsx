"use client";
import SmeDxSubsidy from "./components/SmeDxSubsidy";

export default function SmeDxSubsidyPage() {
  return (
    <div
      className="min-h-screen py-8 px-4"
      style={{ background: "linear-gradient(135deg, #0f1f3d 0%, #1a3a6b 50%, #0f1f3d 100%)" }}
    >
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-2">DX補助金 適合度診断</h1>
        <p className="text-blue-200 mb-8">
          企業情報と導入予定のITツールを入力するだけで、IT導入補助金・ものづくり補助金・事業再構築補助金の適合度と想定補助額を即判定します
        </p>
        <SmeDxSubsidy />
      </div>
    </div>
  );
}
