import type { Metadata } from "next";
import ToolPage from "@/tools/kenpei-yoseki/page";

export const metadata: Metadata = {
  title: "建蔽率・容積率 計算ツール - 最大建築面積・延べ床面積を概算",
  description: "敷地面積、建蔽率、容積率、前面道路幅員から最大建築面積と最大延べ床面積を概算。指定容積率と道路幅員制限を比較し、土地購入や建築計画の初期確認に使える無料ツール。",
  alternates: { canonical: "https://tools.loresync.dev/kenpei-yoseki" },
};

export default function Page() {
  return <ToolPage />;
}
