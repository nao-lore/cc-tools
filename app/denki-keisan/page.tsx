import type { Metadata } from "next";
import ToolPage from "@/tools/denki-keisan/page";

export const metadata: Metadata = {
  title: "電気代計算ツール - 家電別の月額・年額・消費電力量を計算",
  description: "家電の消費電力、使用時間、使用日数、台数から1日・1ヶ月・1年の電気代を計算。複数家電の合計、プリセット、CSV出力に対応。",
  alternates: { canonical: "https://tools.loresync.dev/denki-keisan" },
};

export default function Page() {
  return <ToolPage />;
}
