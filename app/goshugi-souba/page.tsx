import type { Metadata } from "next";
import ToolPage from "@/tools/goshugi-souba/page";

export const metadata: Metadata = {
  title: "ご祝儀相場 計算 — 続柄・年代・関係性別の金額目安",
  description: "結婚式のご祝儀相場を即判定。友人・同僚・上司・親族など続柄別、20代〜60代の年代別、地域別の金額目安。ご祝儀袋の書き方・マナーも解説。",
  alternates: { canonical: "https://tools.loresync.dev/goshugi-souba" },
};

export default function Page() {
  return <ToolPage />;
}
