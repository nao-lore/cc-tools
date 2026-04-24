"use client";
import AbTestSignificance from "./components/AbTestSignificance";

export default function AbTestSignificancePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-100 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">A/Bテスト 有意差計算</h1>
        <p className="text-gray-600 mb-8">訪問数とCV数を入力するだけでp値・信頼区間・必要サンプルサイズを即計算</p>
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
