import type { Metadata } from "next";
import ToolPage from "@/tools/dalle-pricing/page";

export const metadata: Metadata = {
  title: "OpenAI 画像生成 料金計算 - GPT-image-2・GPT Image 1・DALL-E 3",
  description: "OpenAI Image APIの料金を、GPT-image-2、GPT Image 1、DALL-E 3の枚数・品質・サイズ・入力トークン・為替レートから日本円で概算します。",
  alternates: { canonical: "https://tools.loresync.dev/dalle-pricing" },
};

export default function Page() {
  return <ToolPage />;
}
