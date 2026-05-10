import type { Metadata } from "next";
import ToolPage from "@/tools/moji-count/page";

export const metadata: Metadata = {
  title: "文字数カウント - 日本語の文字数・バイト数・文字種別を確認",
  description: "日本語テキストの文字数、スペースなし文字数、行数、段落数、UTF-8バイト数、Shift_JIS概算、ひらがな・カタカナ・漢字の内訳をブラウザ内でカウント。",
  alternates: { canonical: "https://tools.loresync.dev/moji-count" },
};

export default function Page() {
  return <ToolPage />;
}
