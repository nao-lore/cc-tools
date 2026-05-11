import type { Metadata } from "next";
import ToolPage from "@/tools/aircon-capacity/page";

export const metadata: Metadata = {
  title: "エアコン適正容量計算ツール - 畳数・日当たり・断熱から能力クラスを確認",
  description: "部屋の畳数、窓の向き、階数、断熱、天井高、地域条件からエアコンの適正容量(kW)を見積もり。電気代の概算も確認できます。",
  alternates: { canonical: "https://tools.loresync.dev/aircon-capacity" },
};

export default function Page() {
  return <ToolPage />;
}
