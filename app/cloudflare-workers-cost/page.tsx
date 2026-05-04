import type { Metadata } from "next";
import ToolPage from "@/tools/cloudflare-workers-cost/page";

export const metadata: Metadata = {
  title: "Cloudflare Workers 料金計算 — リクエスト数・CPU時間 コストシミュレーター",
  description: "Cloudflare Workers（Free/Paid）の月額料金をシミュレーション。リクエスト数・CPU時間・KV・R2・D1の従量課金を日本語で計算。",
  alternates: { canonical: "https://tools.loresync.dev/cloudflare-workers-cost" },
};

export default function Page() {
  return <ToolPage />;
}
