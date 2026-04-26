import type { Metadata } from "next";
import ToolPage from "@/tools/render-fly-railway-comparison/page";

export const metadata: Metadata = {
  title: "Render vs Fly.io vs Railway 料金比較 — 個人開発者向けPaaS",
  description: "Render、Fly.io、Railwayの3社PaaS料金を比較。CPU・メモリ・帯域幅・データベース・無料枠を日本語で一覧。個人開発者のデプロイ先選びに。",
  alternates: { canonical: "https://tools.loresync.dev/render-fly-railway-comparison" },
};

export default function Page() {
  return <ToolPage />;
}
