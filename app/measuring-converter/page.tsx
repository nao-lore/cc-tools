import type { Metadata } from "next";
import ToolPage from "@/tools/measuring-converter/page";

export const metadata: Metadata = {
  title: "計量スプーン・カップ グラム換算 - 大さじ・小さじ・カップを食材別に換算",
  description: "大さじ、小さじ、計量カップ、グラムを食材別に相互換算。水、醤油、砂糖、塩、小麦粉などの家庭用計量目安に対応。CSV出力・コピー対応。",
  alternates: { canonical: "https://tools.loresync.dev/measuring-converter" },
};

export default function Page() {
  return <ToolPage />;
}
