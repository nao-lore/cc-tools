"use client";
import AbTestSignificance from "./components/AbTestSignificance";

export default function AbTestSignificancePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f0a1a] via-[#1a1030] to-[#0d0d2b] py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-2">A/Bテスト 有意差計算</h1>
        <p className="text-violet-100 mb-8">訪問数とCV数を入力するだけでp値・信頼区間・必要サンプルサイズを即計算</p>
        <AbTestSignificance />
      </div>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: `{
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "A/Bテスト 有意差計算",
  "description": "訪問数とCV数を入力するだけでp値・信頼区間・必要サンプルサイズを即計算",
  "url": "https://tools.loresync.dev/ab-test-significance",
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
