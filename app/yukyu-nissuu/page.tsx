import type { Metadata } from "next";
import ToolPage from "@/tools/yukyu-nissuu/page";

export const metadata: Metadata = {
  title: "有給休暇 付与日数計算ツール - 通常付与・比例付与・年5日義務",
  description: "入社日、基準日、週所定労働日数から年次有給休暇の法定付与日数を計算。パート・アルバイトの比例付与、年5日の取得義務、2年時効の繰越目安も確認できます。",
  alternates: { canonical: "https://tools.loresync.dev/yukyu-nissuu" },
};

export default function Page() {
  return <ToolPage />;
}
