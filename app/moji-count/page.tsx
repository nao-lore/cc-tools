import type { Metadata } from "next";
import ToolPage from "@/tools/moji-count/page";

export const metadata: Metadata = {
  title: "文字数カウント - ひらがな・カタカナ・漢字別",
  description: "日本語テキストの文字数、単語数、バイト数をリアルタイムでカウント。ひらがな・カタカナ・漢字・英数字を個別に集計。",
  alternates: { canonical: "https://tools.loresync.dev/moji-count" },
};

export default function Page() {
  return <ToolPage />;
}
