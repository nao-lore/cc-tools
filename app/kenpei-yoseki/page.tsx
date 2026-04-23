import type { Metadata } from "next";
import ToolPage from "@/tools/kenpei-yoseki/page";

export const metadata: Metadata = {
  title: "建蔽率・容積率 計算ツール — 最大建築面積・延べ床面積を自動計算",
  description: "敷地面積と用途地域を入力するだけで建蔽率・容積率から最大建築面積・最大延べ床面積を自動計算。法適合チェック・概算階数表示付き。土地購入・注文住宅・リフォーム計画の事前確認に役立つ無料ツール。",
  alternates: { canonical: "https://tools.loresync.dev/kenpei-yoseki" },
};

export default function Page() {
  return <ToolPage />;
}
