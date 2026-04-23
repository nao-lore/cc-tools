import type { Metadata } from "next";
import ToolPage from "@/tools/jigyou-keihi-bunrui/page";

export const metadata: Metadata = {
  title: "経費 勘定科目 判別ツール — フリーランス・個人事業主向け",
  description: "経費の内容を入力するだけで勘定科目を即座に判別。旅費交通費・通信費・接待交際費・消耗品費など主要10科目に対応。確定申告・青色申告の仕訳作業を効率化するフリーランス・個人事業主向けの無料ツール。",
  alternates: { canonical: "https://tools.loresync.dev/jigyou-keihi-bunrui" },
};

export default function Page() {
  return <ToolPage />;
}
