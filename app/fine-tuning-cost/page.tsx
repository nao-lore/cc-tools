import type { Metadata } from "next";
import ToolPage from "@/tools/fine-tuning-cost/page";

export const metadata: Metadata = {
  title: "ファインチューニング 料金計算 — OpenAI GPT / Claude の学習+推論コスト",
  description: "GPT-4o-mini/GPT-4.1-miniのファインチューニング料金を即計算。学習トークン数・エポック数から学習コスト、推論コストとの比較シミュレーション付き。",
  alternates: { canonical: "https://tools.loresync.dev/fine-tuning-cost" },
};

export default function Page() {
  return <ToolPage />;
}
