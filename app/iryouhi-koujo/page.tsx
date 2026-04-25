import type { Metadata } from "next";
import ToolPage from "@/tools/iryouhi-koujo/page";

export const metadata: Metadata = {
  title: "医療費控除 計算 — 還付額と提出要否を即判定",
  description: "医療費控除の還付額を即計算。年間医療費・保険補填額・所得金額から控除額と還付見込み額を算出。セルフメディケーション税制対応。確定申告の要否判定付き。",
  alternates: { canonical: "https://tools.loresync.dev/iryouhi-koujo" },
};

export default function Page() {
  return <ToolPage />;
}
