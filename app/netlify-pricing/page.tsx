import type { Metadata } from "next";
import ToolPage from "@/tools/netlify-pricing/page";

export const metadata: Metadata = {
  title: "Netlify 料金計算 — Starter / Pro / Enterprise コストシミュレーター",
  description: "Netlify（Starter無料/Pro $19）の月額料金をシミュレーション。ビルド時間・帯域幅・サーバーレス関数の従量課金を日本語で計算。Vercelとの比較付き。",
  alternates: { canonical: "https://tools.loresync.dev/netlify-pricing" },
};

export default function Page() {
  return <ToolPage />;
}
