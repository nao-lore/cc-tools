import type { Metadata } from "next";
import ToolPage from "@/tools/cat-human-age/page";

export const metadata: Metadata = {
  title: "猫の年齢→人間換算ツール",
  description: "猫の年齢を人間の年齢に換算。最新の獣医学ベースの換算式。ライフステージ表示。無料ツール。",
  alternates: { canonical: "https://tools.loresync.dev/cat-human-age" },
};

export default function Page() {
  return <ToolPage />;
}
