import type { Metadata } from "next";
import ToolPage from "@/tools/ad-budget-estimator/page";

export const metadata: Metadata = {
  title: "広告予算逆算ツール - CV・CPA・CVR・CTRから必要予算を計算",
  description: "目標CV数、CPA、CVR、CTR、CPCから広告予算、クリック数、インプレッション数、ROASを概算。Google広告・SNS広告の初期予算計画に使える無料ツール。",
  alternates: { canonical: "https://tools.loresync.dev/ad-budget-estimator" },
};

export default function Page() {
  return <ToolPage />;
}
