import type { Metadata } from "next";
import ToolPage from "@/tools/video-bitrate/page";

export const metadata: Metadata = {
  title: "動画ビットレート計算 — 解像度・fps・コーデック別のファイルサイズ予測",
  description: "動画のビットレートからファイルサイズを即計算。解像度（720p/1080p/4K）・fps・コーデック（H.264/H.265/VP9/AV1）別の推奨ビットレート表付き。",
  alternates: { canonical: "https://tools.loresync.dev/video-bitrate" },
};

export default function Page() {
  return <ToolPage />;
}
