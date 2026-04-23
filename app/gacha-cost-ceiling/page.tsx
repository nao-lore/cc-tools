import type { Metadata } from "next";
import ToolPage from "@/tools/gacha-cost-ceiling/page";

export const metadata: Metadata = {
  title: "ガチャ 天井コスト計算ツール — 期待値・最大コスト シミュレーション",
  description: "ガチャの天井・排出率・1回コストから期待値と最大コスト（天井コスト）を計算。原神・スターレイル・ブルアカ・FGO対応プリセット付き。複数キャラ取得コストや残り天井数もシミュレーション可能。",
  alternates: { canonical: "https://tools.loresync.dev/gacha-cost-ceiling" },
};

export default function Page() {
  return <ToolPage />;
}
