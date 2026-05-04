import type { Metadata } from "next";
import ToolPage from "@/tools/github-actions-cost/page";

export const metadata: Metadata = {
  title: "GitHub Actions 料金計算 — 実行時間・ストレージ コストシミュレーター",
  description: "GitHub Actionsの月額料金をシミュレーション。Linux/Windows/macOSランナー別の実行時間・ストレージ・Larger Runner料金を日本語で計算。",
  alternates: { canonical: "https://tools.loresync.dev/github-actions-cost" },
};

export default function Page() {
  return <ToolPage />;
}
