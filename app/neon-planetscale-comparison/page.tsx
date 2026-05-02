import type { Metadata } from "next";
import ToolPage from "@/tools/neon-planetscale-comparison/page";

export const metadata: Metadata = {
  title: "サーバーレスDB比較 — Neon / PlanetScale / Turso 料金・機能",
  description: "Neon(Postgres)・PlanetScale(MySQL)・Turso(SQLite)のサーバーレスDB料金・無料枠・機能を横断比較。ストレージ・コンピュート・ブランチングを日本語で一覧。",
  alternates: { canonical: "https://tools.loresync.dev/neon-planetscale-comparison" },
};

export default function Page() {
  return <ToolPage />;
}
