import type { Metadata } from "next";
import ToolPage from "@/tools/wareki-converter/page";

export const metadata: Metadata = {
  title: "和暦西暦変換ツール - 年齢早見表付き | wareki",
  description: "和暦と西暦をかんたん変換。令和・平成・昭和・大正・明治に対応。年齢早見表・干支表示・履歴書用フォーマット付き。無料で使えるオンライン変換ツール。",
  alternates: { canonical: "https://tools.loresync.dev/wareki-converter" },
};

export default function Page() {
  return <ToolPage />;
}
