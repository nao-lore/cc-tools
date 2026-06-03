import type { Metadata } from "next";
import ToolPage from "@/tools/chien-songai-kin/page";

export const metadata: Metadata = {
  title: "遅延損害金計算ツール",
  description: "元本・遅延期間・利率（年3%/5%/14.6%）から遅延損害金を計算。民法・商法・消費者契約別。無料ツール。",
  alternates: { canonical: "https://tools.loresync.dev/chien-songai-kin" },
};

export default function Page() {
  return <ToolPage />;
}
