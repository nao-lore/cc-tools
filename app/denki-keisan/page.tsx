import type { Metadata } from "next";
import ToolPage from "@/tools/denki-keisan/page";

export const metadata: Metadata = {
  title: "電気代計算 - 家電別の電気料金計算",
  description: "消費電力と使用時間から1日・1ヶ月・1年の電気代を計算。複数家電の合計にも対応。",
  alternates: { canonical: "https://tools.loresync.dev/denki-keisan" },
};

export default function Page() {
  return <ToolPage />;
}
