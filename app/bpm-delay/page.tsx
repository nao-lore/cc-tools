import type { Metadata } from "next";
import ToolPage from "@/tools/bpm-delay/page";

export const metadata: Metadata = {
  title: "BPM⇔ディレイタイム変換",
  description: "BPMから音符別ディレイタイム(ms)を計算。1/4・1/8・1/16・付点・3連符対応。DTM・音楽制作向け。無料ツール。",
  alternates: { canonical: "https://tools.loresync.dev/bpm-delay" },
};

export default function Page() {
  return <ToolPage />;
}
