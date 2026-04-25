import type { Metadata } from "next";
import ToolPage from "@/tools/houjin-nari/page";

export const metadata: Metadata = {
  title: "法人成り シミュレーション — 個人事業主 vs 法人の手取り比較",
  description: "法人成りのメリットを年収別にシミュレーション。個人事業主vs法人の所得税・住民税・社会保険・法人税を比較して損益分岐点を即判定。",
  alternates: { canonical: "https://tools.loresync.dev/houjin-nari" },
};

export default function Page() {
  return <ToolPage />;
}
