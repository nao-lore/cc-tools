import type { Metadata } from "next";
import ToolPage from "@/tools/yukyu-nissuu/page";

export const metadata: Metadata = {
  title: "有給休暇 付与日数計算 — 勤続年数・週所定労働日数から法定付与日数を即計算",
  description: "有給休暇の付与日数を即計算。勤続年数・週所定労働日数から法定付与日数を算出。パート・アルバイトの比例付与、繰越上限、時効（2年）も対応。",
  alternates: { canonical: "https://tools.loresync.dev/yukyu-nissuu" },
};

export default function Page() {
  return <ToolPage />;
}
