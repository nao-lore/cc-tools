import type { Metadata } from "next";
import ToolPage from "@/tools/measuring-converter/page";

export const metadata: Metadata = {
  title: "大さじ・小さじ・カップ グラム換算ツール — 食材別の正確な計量",
  description: "大さじ・小さじ・カップをグラムに換算。砂糖・塩・醤油・小麦粉など食材別の比重に基づいた正確な計算。グラムから計量スプーン・カップへの逆換算も可能。料理・お菓子作りの計量に役立つ無料ツール。",
  alternates: { canonical: "https://tools.loresync.dev/measuring-converter" },
};

export default function Page() {
  return <ToolPage />;
}
