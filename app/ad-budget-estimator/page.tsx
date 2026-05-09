import type { Metadata } from "next";
import ToolPage from "@/tools/ad-budget-estimator/page";

export const metadata: Metadata = {
  title: "広告予算逆算ツール",
  description: "目標CV数・CPA・CTRから必要インプレッション数と広告予算を逆算。Google広告・SNS広告の予算計画に。無料。",
  alternates: { canonical: "https://tools.loresync.dev/ad-budget-estimator" },
};

export default function Page() {
  return <ToolPage />;
}
