import type { Metadata } from "next";
import ToolPage from "@/tools/whisper-api-cost/page";

export const metadata: Metadata = {
  title: "Whisper API 料金計算 — 音声文字起こしのコストを時間から即計算",
  description: "Whisper API（音声→テキスト変換）の料金を即計算。音声時間から月額コスト試算。Google Speech-to-Text、Amazon Transcribeとの比較付き。",
  alternates: { canonical: "https://tools.loresync.dev/whisper-api-cost" },
};

export default function Page() {
  return <ToolPage />;
}
