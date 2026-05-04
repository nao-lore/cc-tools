import type { Metadata } from "next";
import ToolPage from "@/tools/gemini-api-cost/page";

export const metadata: Metadata = {
  title: "Gemini API 料金計算 — Pro / Flash コストシミュレーター",
  description: "Gemini API（2.5 Pro / 2.5 Flash / 2.0 Flash）の料金をトークン数から計算。コンテキスト長別料金・月額シミュレーション付き。無料・登録不要。",
  alternates: { canonical: "https://tools.loresync.dev/gemini-api-cost" },
};

export default function Page() {
  return <ToolPage />;
}
