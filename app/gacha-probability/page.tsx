import type { Metadata } from "next";
import ToolPage from "@/tools/gacha-probability/page";

export const metadata: Metadata = {
  title: "ガチャ確率 計算 — 排出率と試行回数から当選確率を即計算",
  description: "ガチャの排出率と回数から当選確率を即計算。天井までの必要金額、期待値グラフ、確率分布表示付き。ソシャゲ・ガチャシミュレーター。",
  alternates: { canonical: "https://tools.loresync.dev/gacha-probability" },
};

export default function Page() {
  return <ToolPage />;
}
