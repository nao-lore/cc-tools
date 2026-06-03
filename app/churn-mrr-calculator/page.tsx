import type { Metadata } from "next";
import ToolPage from "@/tools/churn-mrr-calculator/page";

export const metadata: Metadata = {
  title: "Churn率・MRR計算ツール",
  description: "月次解約率・MRR・ネットレベニューリテンション(NRR)を計算。SaaSメトリクス。無料ツール。",
  alternates: { canonical: "https://tools.loresync.dev/churn-mrr-calculator" },
};

export default function Page() {
  return <ToolPage />;
}
