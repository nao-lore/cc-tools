import type { Metadata } from "next";
import ToolPage from "@/tools/stripe-fee-calculator/page";

export const metadata: Metadata = {
  title: "Stripe 手数料計算 — 日本のカード決済・コンビニ・銀行振込の手数料を即計算",
  description: "Stripe日本の決済手数料を即計算。クレジットカード（3.6%）、コンビニ決済（3.6%/¥190上限）、銀行振込、Link決済の手数料と実収入を計算。",
  alternates: { canonical: "https://tools.loresync.dev/stripe-fee-calculator" },
};

export default function Page() {
  return <ToolPage />;
}
