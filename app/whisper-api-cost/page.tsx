import type { Metadata } from "next";
import ToolPage from "@/tools/whisper-api-cost/page";

export const metadata: Metadata = {
  title: "OpenAI 音声文字起こし 料金計算 - GPT-4o Transcribe・Whisper",
  description: "OpenAIの音声文字起こしAPI料金を、GPT-4o Transcribe、GPT-4o mini Transcribe、Whisperの音声分数・ファイル数・為替レートから概算します。",
  alternates: { canonical: "https://tools.loresync.dev/whisper-api-cost" },
};

export default function Page() {
  return <ToolPage />;
}
