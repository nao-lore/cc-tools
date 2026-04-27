import type { Metadata } from "next";
import ToolPage from "@/tools/subscription-lifetime/page";

export const metadata: Metadata = {
  title: "サブスク生涯コスト計算 — 月額の積み重ねを10年分で可視化",
  description: "サブスクの生涯コストを可視化。月額料金を登録するだけで1年・5年・10年の総額をグラフ表示。Netflix、Spotify、Adobe等のプリセット付き。",
  alternates: { canonical: "https://tools.loresync.dev/subscription-lifetime" },
};

export default function Page() {
  return <ToolPage />;
}
