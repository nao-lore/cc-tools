import type { Metadata } from "next";
import ToolPage from "@/tools/furigana/page";

export const metadata: Metadata = {
  title: "ふりがな変換ツール - 漢字にふりがなを自動付与 | 無料オンラインツール",
  description: "漢字にふりがな（ルビ）を自動で付けるオンラインツールです。テキストを入力するだけで、漢字の読み方をひらがなで表示します。HTML rubyタグ、括弧表示、ひらがな変換に対応。教育・学習・日本語学習者に最適。",
  alternates: { canonical: "https://tools.loresync.dev/furigana" },
};

export default function Page() {
  return <ToolPage />;
}
