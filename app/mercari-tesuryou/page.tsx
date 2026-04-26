import type { Metadata } from "next";
import ToolPage from "@/tools/mercari-tesuryou/page";

export const metadata: Metadata = {
  title: "メルカリ 手数料・利益計算 — 販売価格から実利益を即計算",
  description: "メルカリの販売手数料（10%）と配送料を引いた実利益を即計算。らくらくメルカリ便・ゆうゆうメルカリ便の送料対応。目標利益からの逆算機能付き。",
  alternates: { canonical: "https://tools.loresync.dev/mercari-tesuryou" },
};

export default function Page() {
  return <ToolPage />;
}
