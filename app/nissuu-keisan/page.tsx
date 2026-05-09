import type { Metadata } from "next";
import ToolPage from "@/tools/nissuu-keisan/page";

export const metadata: Metadata = {
  title: "日数計算ツール - 日付間の日数・N日後/N日前を計算",
  description: "2つの日付間の日数、週数、年月日換算、時間・分・秒を計算。指定日からN日後・N日前の日付、祝日表示、コピー、CSV出力に対応。",
  alternates: { canonical: "https://tools.loresync.dev/nissuu-keisan" },
};

export default function Page() {
  return <ToolPage />;
}
