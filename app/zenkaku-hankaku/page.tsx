import type { Metadata } from "next";
import ToolPage from "@/tools/zenkaku-hankaku/page";

export const metadata: Metadata = {
  title: "全角・半角変換 - カタカナ・英数字・記号・スペースを一括変換",
  description: "全角と半角を相互変換。カタカナ、英数字、記号、スペースを個別に選択して、住所・氏名・CSV・フォーム入力向けに文字幅を統一できます。コピー・CSV出力対応。",
  alternates: { canonical: "https://tools.loresync.dev/zenkaku-hankaku" },
};

export default function Page() {
  return <ToolPage />;
}
