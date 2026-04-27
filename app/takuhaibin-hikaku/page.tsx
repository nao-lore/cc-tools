import type { Metadata } from "next";
import ToolPage from "@/tools/takuhaibin-hikaku/page";

export const metadata: Metadata = {
  title: "宅配便 送料比較 — ヤマト・佐川・日本郵便の最安を即判定",
  description: "宅配便3社（ヤマト運輸・佐川急便・日本郵便ゆうパック）の送料を即比較。サイズ・重量・発着地域から最安の配送方法を判定。メルカリ/EC出品者必見。",
  alternates: { canonical: "https://tools.loresync.dev/takuhaibin-hikaku" },
};

export default function Page() {
  return <ToolPage />;
}
