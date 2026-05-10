import type { Metadata } from "next";
import ToolPage from "@/tools/tsumitate-sim/page";

export const metadata: Metadata = {
  title: "積立シミュレーション - 新NISA・課税口座・税引後の将来額を計算",
  description: "毎月の積立額、想定年利、年コスト、積立期間から将来の資産額を試算。新NISA枠、課税口座の概算税額、年次推移、CSV出力に対応。",
  alternates: { canonical: "https://tools.loresync.dev/tsumitate-sim" },
};

export default function Page() {
  return <ToolPage />;
}
