import type { Metadata } from "next";
import ToolPage from "@/tools/jigyou-keihi-bunrui/page";

export const metadata: Metadata = {
  title: "経費 勘定科目 候補ツール - 個人事業主・フリーランス向け",
  description: "経費内容から旅費交通費、通信費、会議費、接待交際費、消耗品費などの勘定科目候補を表示。家事按分や高額備品などの確認ポイントも整理できます。",
  alternates: { canonical: "https://tools.loresync.dev/jigyou-keihi-bunrui" },
};

export default function Page() {
  return <ToolPage />;
}
