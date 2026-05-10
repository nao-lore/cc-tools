import type { Metadata } from "next";
import ToolPage from "@/tools/base-stores-fee/page";

export const metadata: Metadata = {
  title: "BASE・STORES 手数料比較 - 月商別の最安プランと乗り換え目安",
  description: "BASEとSTORESの月額費用、決済手数料、実質手数料率を比較。BASEグロース年払い/月払い、STORESスタンダード月額3,300円に対応。",
  alternates: { canonical: "https://tools.loresync.dev/base-stores-fee" },
};

export default function Page() {
  return <ToolPage />;
}
