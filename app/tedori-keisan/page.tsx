import type { Metadata } from "next";
import ToolPage from "@/tools/tedori-keisan/page";

export const metadata: Metadata = {
  title: "手取り計算ツール - 年収から月額手取り・税金・社会保険料を概算",
  description: "額面年収から所得税、住民税、健康保険、厚生年金、雇用保険を差し引いた手取り月額・年額を概算。2026年度の公開料率を初期値にした会社員向け計算ツール。",
  alternates: { canonical: "https://tools.loresync.dev/tedori-keisan" },
};

export default function Page() {
  return <ToolPage />;
}
