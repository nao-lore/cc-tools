import type { Metadata } from "next";
import ToolPage from "@/tools/tedori-keisan/page";

export const metadata: Metadata = {
  title: "手取り計算 - 額面年収から手取りを概算",
  description: "額面年収から所得税・住民税・社会保険料を差し引いた手取り月額・年額を概算計算。",
  alternates: { canonical: "https://tools.loresync.dev/tedori-keisan" },
};

export default function Page() {
  return <ToolPage />;
}
