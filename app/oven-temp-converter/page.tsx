import type { Metadata } from "next";
import ToolPage from "@/tools/oven-temp-converter/page";

export const metadata: Metadata = {
  title: "オーブン温度換算 - 摂氏・華氏・ガスマーク変換ツール",
  description: "摂氏、華氏、ガスマークを相互換算。海外レシピの350°F、375°F、Gas Mark 4などを日本の家庭用オーブン設定に直し、ファン付きオーブンの目安も確認できます。",
  alternates: { canonical: "https://tools.loresync.dev/oven-temp-converter" },
};

export default function Page() {
  return <ToolPage />;
}
