import type { Metadata } from "next";
import ToolPage from "@/tools/waribiki-keisan/page";

export const metadata: Metadata = {
  title: "割引計算 - パーセント・割引き・円引き",
  description: "元の価格と割引率から割引後の価格を計算。パーセント割引、○割引き、円引きに対応。税込価格も自動計算。",
  alternates: { canonical: "https://tools.loresync.dev/waribiki-keisan" },
};

export default function Page() {
  return <ToolPage />;
}
