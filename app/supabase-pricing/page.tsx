import type { Metadata } from "next";
import ToolPage from "@/tools/supabase-pricing/page";

export const metadata: Metadata = {
  title: "Supabase 料金計算 — Free / Pro / Team コストシミュレーター",
  description: "Supabase（Free/Pro/Team）の月額料金をシミュレーション。データベース容量・ストレージ・認証MAU・Edge Functionsの従量課金を日本語で計算。",
  alternates: { canonical: "https://tools.loresync.dev/supabase-pricing" },
};

export default function Page() {
  return <ToolPage />;
}
