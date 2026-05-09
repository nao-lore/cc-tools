import type { Metadata } from "next";
import ToolPage from "@/tools/calorie-keisan/page";

export const metadata: Metadata = {
  title: "カロリー計算ツール - 基礎代謝・TDEE・PFC目安",
  description: "年齢、性別、身長、体重、活動レベルから基礎代謝量と1日の推定消費カロリーを計算。維持・減量・増量カロリーとPFC目安も表示。",
  alternates: { canonical: "https://tools.loresync.dev/calorie-keisan" },
};

export default function Page() {
  return <ToolPage />;
}
