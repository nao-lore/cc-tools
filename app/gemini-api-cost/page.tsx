import type { Metadata } from "next";
import ToolPage from "@/tools/gemini-api-cost/page";

export const metadata: Metadata = {
  title: "Gemini API 料金計算 - Gemini 3.1・3 Flash・2.5 Pro/Flashの月額概算",
  description: "Gemini APIの料金を、入力・出力・context caching・storage・Search/Maps Grounding・為替レートから日本円で概算します。",
  alternates: { canonical: "https://tools.loresync.dev/gemini-api-cost" },
};

export default function Page() {
  return <ToolPage />;
}
