import type { Metadata } from "next";
import ToolPage from "@/tools/aojiro-shinkoku-sim/page";

export const metadata: Metadata = {
  title: "青色申告 節税シミュレーター — 65万/55万/10万控除の効果を即計算",
  description: "青色申告特別控除（65万/55万/10万円）の節税額を即計算。白色申告との比較、適用条件チェック、所得税・住民税・国保への影響を一画面で確認。",
  alternates: { canonical: "https://tools.loresync.dev/aojiro-shinkoku-sim" },
};

export default function Page() {
  return <ToolPage />;
}
