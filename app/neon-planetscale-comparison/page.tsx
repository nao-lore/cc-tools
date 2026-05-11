import type { Metadata } from "next";
import ToolPage from "@/tools/neon-planetscale-comparison/page";

export const metadata: Metadata = {
  title: "Neon / PlanetScale / Turso 料金比較 - サーバーレスDB費用を概算",
  description: "Neon、PlanetScale、Tursoの料金軸を比較。CU-hours、cluster、storage、rows read/write、無料枠、入口価格を日本語で確認できます。",
  alternates: { canonical: "https://tools.loresync.dev/neon-planetscale-comparison" },
};

export default function Page() {
  return <ToolPage />;
}
