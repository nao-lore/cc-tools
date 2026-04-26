import type { Metadata } from "next";
import ToolPage from "@/tools/recipe-scaling/page";

export const metadata: Metadata = {
  title: "レシピ分量計算 — 人数変更で材料を自動調整",
  description: "レシピの分量を人数に合わせて自動計算。2人前→5人前の材料調整、大さじ・カップのグラム換算、よく使う食材の密度データベース付き。",
  alternates: { canonical: "https://tools.loresync.dev/recipe-scaling" },
};

export default function Page() {
  return <ToolPage />;
}
