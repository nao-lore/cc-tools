"use client";
import AiVideoPricing from "./components/AiVideoPricing";

export default function AiVideoPricingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-fuchsia-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">AI動画生成 料金比較</h1>
        <p className="text-gray-600 mb-8">Sora / Runway / Pika / Kling / Luma — 料金・生成秒数・解像度・機能を横断比較</p>
        <AiVideoPricing />
      </div>
    
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: `{
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "AI動画生成 料金比較",
  "description": "Sora / Runway / Pika / Kling / Luma — 料金・生成秒数・解像度・機能を横断比較",
  "url": "https://tools.loresync.dev/ai-video-pricing",
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
