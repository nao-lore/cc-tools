import type { Metadata } from "next";
import ToolPage from "@/tools/amazon-fba-fee/page";

export const metadata: Metadata = {
  title: "Amazon FBA 手数料計算 — 販売手数料+配送代行手数料から利益を即計算",
  description: "Amazon FBAの手数料を即計算。販売価格・商品サイズ・カテゴリから販売手数料(8-15%)・配送代行手数料・在庫保管料を算出。実利益シミュレーション付き。",
  alternates: { canonical: "https://tools.loresync.dev/amazon-fba-fee" },
};

export default function Page() {
  return <ToolPage />;
}
