import type { Metadata } from "next";
import ToolPage from "@/tools/click-post-size/page";

export const metadata: Metadata = {
  title: "メール便・小型配送 サイズ判定 — ネコポス/クリックポスト/ゆうパケット比較",
  description: "ネコポス・クリックポスト・ゆうパケット・ゆうパケットポスト・スマートレターの条件適合を即判定。サイズ・重量・厚さから最安の配送方法を比較。",
  alternates: { canonical: "https://tools.loresync.dev/click-post-size" },
};

export default function Page() {
  return <ToolPage />;
}
