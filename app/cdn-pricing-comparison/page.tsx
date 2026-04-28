import type { Metadata } from "next";
import ToolPage from "@/tools/cdn-pricing-comparison/page";

export const metadata: Metadata = {
  title: "CDN料金比較 — Cloudflare / CloudFront / Fastly / BunnyCDN",
  description: "Cloudflare・CloudFront・Fastly・BunnyCDNの料金を横断比較。月間トラフィック量から最安CDNを判定。リージョン別料金・無料枠対応。",
  alternates: { canonical: "https://tools.loresync.dev/cdn-pricing-comparison" },
};

export default function Page() {
  return <ToolPage />;
}
