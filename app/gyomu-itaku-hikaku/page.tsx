import type { Metadata } from "next";
import ToolPage from "@/tools/gyomu-itaku-hikaku/page";

export const metadata: Metadata = {
  title: "業務委託 vs 正社員 手取り比較 — 同じ額面で手取りはいくら違う？",
  description: "業務委託と正社員の手取りを即比較。同じ年収での所得税・住民税・社会保険料・将来年金額の違いを一覧表示。フリーランス転向の判断材料に。",
  alternates: { canonical: "https://tools.loresync.dev/gyomu-itaku-hikaku" },
};

export default function Page() {
  return <ToolPage />;
}
