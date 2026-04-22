import type { Metadata } from "next";
import ToolPage from "@/tools/zenkaku-hankaku/page";

export const metadata: Metadata = {
  title: "全角半角変換ツール - カタカナ・英数字・記号対応 | 無料オンライン変換",
  description: "全角と半角を簡単に変換できる無料オンラインツール。カタカナ、英数字、記号、スペースを個別に選択して一括変換。コピペするだけで即変換できます。",
  alternates: { canonical: "https://tools.loresync.dev/zenkaku-hankaku" },
};

export default function Page() {
  return <ToolPage />;
}
