import type { Metadata } from "next";
import ToolPage from "@/tools/bank-code-lookup/page";

export const metadata: Metadata = {
  title: "銀行コード・支店コード検索",
  description: "銀行名から銀行コード、支店名から支店コードを検索。主要銀行対応。振込時の確認に。無料ツール。",
  alternates: { canonical: "https://tools.loresync.dev/bank-code-lookup" },
};

export default function Page() {
  return <ToolPage />;
}
