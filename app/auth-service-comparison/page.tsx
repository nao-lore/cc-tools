import type { Metadata } from "next";
import ToolPage from "@/tools/auth-service-comparison/page";

export const metadata: Metadata = {
  title: "認証SaaS比較 — Auth0 / Clerk / Supabase Auth / Firebase Auth / Cognito",
  description: "Auth0、Clerk、Supabase Auth、Firebase Auth、Amazon CognitoのMAU別料金・機能・SSO対応を横断比較。個人開発から企業導入まで最適な認証サービスを判定。",
  alternates: { canonical: "https://tools.loresync.dev/auth-service-comparison" },
};

export default function Page() {
  return <ToolPage />;
}
