"use client";
import AuthServiceComparison from "./components/AuthServiceComparison";

export default function AuthServiceComparisonPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-fuchsia-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">認証SaaS 料金比較</h1>
        <p className="text-gray-600 mb-8">Auth0 / Clerk / Supabase Auth / Firebase Auth / Amazon Cognito — MAU別料金・機能・SSO対応を横断比較</p>
        <AuthServiceComparison />
      </div>
    </div>
  );
}
