import type { Metadata } from "next";
import ToolPage from "@/tools/base-stores-fee/page";

export const metadata: Metadata = {
  title: "BASE vs STORES 手数料比較",
  description: "BASEとSTORESの手数料を売上規模別に比較。損益分岐点を算出。ネットショップ開設の判断に。無料ツール。",
  alternates: { canonical: "https://tools.loresync.dev/base-stores-fee" },
};

export default function Page() {
  return <ToolPage />;
}
