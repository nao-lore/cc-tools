import type { Metadata } from "next";
import ToolPage from "@/tools/zei-kin-henkan/page";

export const metadata: Metadata = {
  title: "税込⇔税抜 一括変換ツール",
  description: "税込→税抜・税抜→税込を8%/10%軽減税率対応で変換。レシート複数行一括計算。内税外税両対応。無料ツール。",
  alternates: { canonical: "https://tools.loresync.dev/zei-kin-henkan" },
};

export default function Page() {
  return <ToolPage />;
}
