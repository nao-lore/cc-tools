import type { Metadata } from "next";
import ToolPage from "@/tools/shopify-fee-jp/page";

export const metadata: Metadata = {
  title: "Shopify 手数料計算（日本）— プラン別月額+決済手数料を即計算",
  description: "Shopify（Basic/Standard/Advanced）の日本向け料金を即計算。月額・カード決済手数料（3.4-3.55%）・トランザクション手数料・Shopify Paymentsの仕組みを解説。",
  alternates: { canonical: "https://tools.loresync.dev/shopify-fee-jp" },
};

export default function Page() {
  return <ToolPage />;
}
