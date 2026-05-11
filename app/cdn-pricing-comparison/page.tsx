import type { Metadata } from "next";
import ToolPage from "@/tools/cdn-pricing-comparison/page";

export const metadata: Metadata = {
  title: "CDN料金比較ツール - Cloudflare / CloudFront / Fastly / bunny.net",
  description: "Cloudflare、Amazon CloudFront、Fastly、bunny.netの公開料金をもとに、月間トラフィック・リクエスト数からCDN月額費用を概算比較します。",
  alternates: { canonical: "https://tools.loresync.dev/cdn-pricing-comparison" },
};

export default function Page() {
  return <ToolPage />;
}
