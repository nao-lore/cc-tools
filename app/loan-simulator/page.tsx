import type { Metadata } from "next";
import ToolPage from "@/tools/loan-simulator/page";

export const metadata: Metadata = {
  title: "ローン計算シミュレーター",
  description: "借入金額・金利・返済期間からローンの毎月返済額、総返済額、利息総額を計算。元利均等・元金均等に対応。",
  alternates: { canonical: "https://tools.loresync.dev/loan-simulator" },
};

export default function Page() {
  return <ToolPage />;
}
