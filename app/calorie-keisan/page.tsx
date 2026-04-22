import type { Metadata } from "next";
import ToolPage from "@/tools/calorie-keisan/page";

export const metadata: Metadata = {
  title: "カロリー計算 - 基礎代謝・消費カロリー",
  description: "性別・年齢・身長・体重・活動レベルから基礎代謝量と1日の消費カロリーを計算。PFCバランスも表示。",
  alternates: { canonical: "https://tools.loresync.dev/calorie-keisan" },
};

export default function Page() {
  return <ToolPage />;
}
