import type { Metadata } from "next";
import ToolPage from "@/tools/elevenlabs-pricing/page";

export const metadata: Metadata = {
  title: "ElevenLabs API 料金計算 - TTS・STT・音声処理コストを概算",
  description: "ElevenLabsのText to Speech、Speech to Text、Music、Voice Isolator、DubbingなどのAPI利用料金を文字数・時間・分数・生成回数から概算。USD/JPY換算とcredits目安付き。",
  alternates: { canonical: "https://tools.loresync.dev/elevenlabs-pricing" },
};

export default function Page() {
  return <ToolPage />;
}
