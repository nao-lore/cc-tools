import type { Metadata } from "next";
import ToolPage from "@/tools/loan-simulator/page";

export const metadata: Metadata = {
  title: "ローン返済シミュレーター - 毎月返済額・総利息・年次残高を計算",
  description: "借入金額、金利、返済期間から毎月返済額、総返済額、利息総額、返済比率、年次残高を計算。元利均等・元金均等・CSV出力に対応。",
  alternates: { canonical: "https://tools.loresync.dev/loan-simulator" },
};

export default function Page() {
  return <ToolPage />;
}
