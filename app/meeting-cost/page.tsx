import type { Metadata } from "next";
import ToolPage from "@/tools/meeting-cost/page";

export const metadata: Metadata = {
  title: "会議コスト計算 — 参加者の時給×人数×時間で会議の値段を可視化",
  description: "会議のコストを即計算。参加者の年収・人数・時間から1回あたりの会議コストを算出。月間・年間コストも表示。会議の生産性改善に。",
  alternates: { canonical: "https://tools.loresync.dev/meeting-cost" },
};

export default function Page() {
  return <ToolPage />;
}
