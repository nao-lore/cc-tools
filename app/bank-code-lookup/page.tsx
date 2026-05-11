import type { Metadata } from "next";
import ToolPage from "@/tools/bank-code-lookup/page";

export const metadata: Metadata = {
  title: "銀行コード・支店コード検索 - 金融機関コードと店番号を確認",
  description: "銀行名、銀行コード、支店名、支店コードから主要銀行のコードを検索。コピー機能付き。振込前の下調べや口座登録の確認に使える無料ツール。",
  alternates: { canonical: "https://tools.loresync.dev/bank-code-lookup" },
};

export default function Page() {
  return <ToolPage />;
}
