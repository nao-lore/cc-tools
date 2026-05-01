import type { Metadata } from "next";
import ToolPage from "@/tools/ideco-tax-saving/page";

export const metadata: Metadata = {
  title: "iDeCo 節税額計算 — 掛金・所得・年齢から節税効果を即計算",
  description: "iDeCo（個人型確定拠出年金）の節税額を即計算。掛金・年収・年齢から所得税+住民税の年間節税額を算出。職業別掛金上限・運用益非課税メリットも解説。",
  alternates: { canonical: "https://tools.loresync.dev/ideco-tax-saving" },
};

export default function Page() {
  return <ToolPage />;
}
