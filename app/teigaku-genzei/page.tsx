import type { Metadata } from "next";
import ToolPage from "@/tools/teigaku-genzei/page";

export const metadata: Metadata = {
  title: "定額減税 計算機 — 所得税3万円・住民税1万円の減税シミュレーター",
  description: "定額減税（所得税3万円＋住民税1万円×本人＋扶養家族数）の減税額を即計算。年収別の減税効果、給与明細への反映シミュレーション付き。2024-2025年対応。",
  alternates: { canonical: "https://tools.loresync.dev/teigaku-genzei" },
};

export default function Page() {
  return <ToolPage />;
}
