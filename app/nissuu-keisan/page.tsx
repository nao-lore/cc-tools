import type { Metadata } from "next";
import ToolPage from "@/tools/nissuu-keisan/page";

export const metadata: Metadata = {
  title: "日数計算 - 日付間の日数・○日後計算",
  description: "2つの日付間の日数や、指定日から○日後・○日前の日付を計算。祝日表示付き。",
  alternates: { canonical: "https://tools.loresync.dev/nissuu-keisan" },
};

export default function Page() {
  return <ToolPage />;
}
