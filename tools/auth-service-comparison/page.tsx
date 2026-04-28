"use client";
import AuthServiceComparison from "./components/AuthServiceComparison";

export default function AuthServiceComparisonPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f0a1a] via-[#1a1030] to-[#0d0d2b] py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-2">認証SaaS 料金比較</h1>
        <p className="text-violet-100 mb-8">Auth0 / Clerk / Supabase Auth / Firebase Auth / Amazon Cognito — MAU別料金・機能・SSO対応を横断比較</p>
        <AuthServiceComparison />
      </div>
    
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: `{
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "認証SaaS 料金比較",
  "description": "Auth0 / Clerk / Supabase Auth / Firebase Auth / Amazon Cognito — MAU別料金・機能・SSO対応を横断比較",
  "url": "https://tools.loresync.dev/auth-service-comparison",
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
