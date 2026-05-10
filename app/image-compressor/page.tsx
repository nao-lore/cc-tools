import type { Metadata } from "next";
import ToolPage from "@/tools/image-compressor/page";

export const metadata: Metadata = {
  title: "画像圧縮ツール - JPEG/PNG/WebPをブラウザ内で軽量化",
  description: "JPEG、PNG、WebP画像をブラウザ内で圧縮。品質、形式、最大サイズを調整して、Web掲載・SNS投稿・メール添付向けに軽量化できます。画像は外部送信されません。",
  alternates: { canonical: "https://tools.loresync.dev/image-compressor" },
};

export default function Page() {
  return <ToolPage />;
}
