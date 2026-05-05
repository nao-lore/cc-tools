import type { Metadata } from "next";
import ToolPage from "@/tools/sme-dx-subsidy/page";

export const metadata: Metadata = {
  title: "中小企業 DX補助金 適合度診断 — IT導入補助金・ものづくり補助金",
  description: "中小企業向けDX補助金の適合度を即診断。IT導入補助金・ものづくり補助金・事業再構築補助金の対象要件・補助率・上限額をチェック。申請期限カレンダー付き。",
  alternates: { canonical: "https://tools.loresync.dev/sme-dx-subsidy" },
};

export default function Page() {
  return <ToolPage />;
}
