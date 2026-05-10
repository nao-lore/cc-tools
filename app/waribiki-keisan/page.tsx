import type { Metadata } from "next";
import ToolPage from "@/tools/waribiki-keisan/page";

export const metadata: Metadata = {
  title: "割引計算ツール - %OFF・○割引・円引き・税込価格を計算",
  description: "元値と割引から割引後価格、割引額、税込10%、税込8%、複数商品の合計を計算。%OFF、○割引、円引き、CSV出力に対応。",
  alternates: { canonical: "https://tools.loresync.dev/waribiki-keisan" },
};

export default function Page() {
  return <ToolPage />;
}
