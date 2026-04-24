import type { Metadata } from "next";
import ToolPage from "@/tools/firebase-pricing/page";

export const metadata: Metadata = {
  title: "Firebase 料金計算 — Firestore・Storage・Functions コストシミュレーター",
  description: "Firebase（Spark無料/Blaze従量課金）の月額料金をシミュレーション。Firestore・Cloud Storage・Cloud Functions・Authentication・Hostingの従量課金を日本語で計算。",
  alternates: { canonical: "https://tools.loresync.dev/firebase-pricing" },
};

export default function Page() {
  return <ToolPage />;
}
