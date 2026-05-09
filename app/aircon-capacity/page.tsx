import type { Metadata } from "next";
import ToolPage from "@/tools/aircon-capacity/page";

export const metadata: Metadata = {
  title: "エアコン適正容量計算ツール",
  description: "部屋の畳数・方角・階数・断熱性能からエアコンの適正容量(kW)を算出。購入の参考に。無料ツール。",
  alternates: { canonical: "https://tools.loresync.dev/aircon-capacity" },
};

export default function Page() {
  return <ToolPage />;
}
