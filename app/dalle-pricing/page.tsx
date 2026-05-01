import type { Metadata } from "next";
import ToolPage from "@/tools/dalle-pricing/page";

export const metadata: Metadata = {
  title: "DALL-E 画像生成 料金計算 — 解像度別・枚数別コスト",
  description: "DALL-E 3/2の画像生成料金を即計算。解像度（1024×1024/1792×1024）・品質（standard/hd）別の単価と月間コストシミュレーション。",
  alternates: { canonical: "https://tools.loresync.dev/dalle-pricing" },
};

export default function Page() {
  return <ToolPage />;
}
