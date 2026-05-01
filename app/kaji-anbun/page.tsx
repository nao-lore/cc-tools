import type { Metadata } from "next";
import ToolPage from "@/tools/kaji-anbun/page";

export const metadata: Metadata = {
  title: "家事按分 計算 — 在宅フリーランスの経費計上率を即計算",
  description: "家事按分の計算を即座に実行。家賃・電気代・ガス代・水道代・通信費・車両費を事業使用割合で按分。在宅フリーランスの確定申告必須ツール。",
  alternates: { canonical: "https://tools.loresync.dev/kaji-anbun" },
};

export default function Page() {
  return <ToolPage />;
}
