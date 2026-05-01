import type { Metadata } from "next";
import ToolPage from "@/tools/gcp-pricing/page";

export const metadata: Metadata = {
  title: "Google Cloud 料金計算 — Compute Engine / Cloud Run / GCS コストシミュレーター",
  description: "Google Cloud（Compute Engine/Cloud Run/Cloud Storage）の月額料金をシミュレーション。リージョン別料金・無料枠・確約利用割引を日本語で計算。",
  alternates: { canonical: "https://tools.loresync.dev/gcp-pricing" },
};

export default function Page() {
  return <ToolPage />;
}
