"use client";
import AiCodingToolComparison from "./components/AiCodingToolComparison";

export default function AiCodingToolComparisonPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f0a1a] via-[#1a1030] to-[#0d0d2b] py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-2">AIコーディングツール比較</h1>
        <p className="text-violet-100 mb-8">Cursor / GitHub Copilot / Windsurf / Claude Code — 料金・機能・対応モデルを一覧比較</p>
        <AiCodingToolComparison />
      </div>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: `{
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "AIコーディングツール比較",
  "description": "Cursor / GitHub Copilot / Windsurf / Claude Code — 料金・機能・対応モデルを一覧比較",
  "url": "https://tools.loresync.dev/ai-coding-tool-comparison",
  "applicationCategory": "UtilityApplication",
  "operatingSystem": "All",
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "JPY"
  },
  "inLanguage": "ja"
}`
        }}
      />
    </div>
  );
}
