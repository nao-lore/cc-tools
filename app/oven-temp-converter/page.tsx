import type { Metadata } from "next";
import ToolPage from "@/tools/oven-temp-converter/page";

export const metadata: Metadata = {
  title: "オーブン温度換算ツール — 摂氏・華氏・ガスマーク 相互変換",
  description: "オーブンの温度を摂氏（°C）・華氏（°F）・ガスマークに瞬時に変換。海外レシピの華氏温度を日本のオーブン設定に換算。クッキー・ケーキ・パンなどのお菓子作り・料理レシピに対応した無料換算ツール。",
  alternates: { canonical: "https://tools.loresync.dev/oven-temp-converter" },
};

export default function Page() {
  return <ToolPage />;
}
