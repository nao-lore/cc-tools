import type { Metadata } from "next";
import ToolPage from "@/tools/gacha-cost-ceiling/page";

export const metadata: Metadata = {
  title: "ガチャ 天井コスト計算 - 最大コスト・期待値・残り回数を確認",
  description: "天井回数、排出率、1回コストからガチャの最大コスト、期待値、現在の累積からの残り回数を計算。設定例を選んで自由に調整できます。",
  alternates: { canonical: "https://tools.loresync.dev/gacha-cost-ceiling" },
};

export default function Page() {
  return <ToolPage />;
}
