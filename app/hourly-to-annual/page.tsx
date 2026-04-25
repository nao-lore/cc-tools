import type { Metadata } from "next";
import ToolPage from "@/tools/hourly-to-annual/page";

export const metadata: Metadata = {
  title: "時給・年収・月収 相互変換 — 正社員・パート・フリーランス対応",
  description: "時給↔年収↔月収を即変換。正社員・パート・フリーランス対応。勤務時間・日数・有給休暇・残業時間を考慮した正確な換算。手取り概算付き。",
  alternates: { canonical: "https://tools.loresync.dev/hourly-to-annual" },
};

export default function Page() {
  return <ToolPage />;
}
