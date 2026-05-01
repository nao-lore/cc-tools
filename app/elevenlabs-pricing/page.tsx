import type { Metadata } from "next";
import ToolPage from "@/tools/elevenlabs-pricing/page";

export const metadata: Metadata = {
  title: "ElevenLabs 料金計算 — 音声合成の文字数別コストシミュレーター",
  description: "ElevenLabs（AI音声合成）の料金を文字数から即計算。Free/Starter/Creator/Pro/Scaleプランの比較、月間使用量シミュレーション付き。",
  alternates: { canonical: "https://tools.loresync.dev/elevenlabs-pricing" },
};

export default function Page() {
  return <ToolPage />;
}
