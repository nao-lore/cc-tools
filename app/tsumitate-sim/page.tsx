import type { Metadata } from "next";
import ToolPage from "@/tools/tsumitate-sim/page";

export const metadata: Metadata = {
  title: "積立シミュレーション - つみたてNISA対応",
  description: "毎月の積立額と想定利回りから最終積立額・運用益をシミュレーション。つみたてNISA枠の参考表示付き。",
  alternates: { canonical: "https://tools.loresync.dev/tsumitate-sim" },
};

export default function Page() {
  return <ToolPage />;
}
