import type { Metadata } from "next";
import ToolPage from "@/tools/zangyou-dai/page";

export const metadata: Metadata = {
  title: "残業代 計算機 — 法定/所定・深夜・休日・60時間超を正確に計算",
  description: "残業代を即座に計算。法定時間外（25%）、深夜（25%→50%）、休日（35%）、月60時間超（50%）を自動区分。月給・時給両対応。2024年法改正対応。",
  alternates: { canonical: "https://tools.loresync.dev/zangyou-dai" },
};

export default function Page() {
  return <ToolPage />;
}
