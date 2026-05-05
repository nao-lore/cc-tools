import type { Metadata } from "next";
import ToolPage from "@/tools/vercel-pricing/page";

export const metadata: Metadata = {
  title: "Vercel 料金計算 — Hobby / Pro / Enterprise コストシミュレーター",
  description: "Vercel（Hobby/Pro/Enterprise）の月額料金をシミュレーション。帯域幅・ビルド時間・サーバーレス関数・Edge関数の従量課金を日本語で計算。",
  alternates: { canonical: "https://tools.loresync.dev/vercel-pricing" },
};

export default function Page() {
  return <ToolPage />;
}
