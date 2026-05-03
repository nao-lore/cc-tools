import type { Metadata } from "next";
import ToolPage from "@/tools/youtube-revenue/page";

export const metadata: Metadata = {
  title: "YouTube 収益計算 — 再生数・RPMから月収を即シミュレーション",
  description: "YouTube収益を再生回数から即計算。ジャンル別RPM（広告単価）目安、チャンネル登録者数別の想定再生数、月収・年収シミュレーション。",
  alternates: { canonical: "https://tools.loresync.dev/youtube-revenue" },
};

export default function Page() {
  return <ToolPage />;
}
