import type { Metadata } from "next";
import ToolPage from "@/tools/ai-video-pricing/page";

export const metadata: Metadata = {
  title: "AI動画生成 料金比較 — Sora / Runway / Pika / Kling / Luma 一覧",
  description: "Sora、Runway Gen-3、Pika、Kling、Luma Dream MachineのAI動画生成サービスを料金・生成秒数・解像度・機能で比較。用途別おすすめ付き。",
  alternates: { canonical: "https://tools.loresync.dev/ai-video-pricing" },
};

export default function Page() {
  return <ToolPage />;
}
