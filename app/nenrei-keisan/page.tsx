import type { Metadata } from "next";
import ToolPage from "@/tools/nenrei-keisan/page";

export const metadata: Metadata = {
  title: "年齢計算ツール - 満年齢・数え年・干支・星座",
  description: "生年月日から満年齢、数え年、干支、星座、経過日数を瞬時に計算。無料で使えるオンライン年齢計算ツール。",
  alternates: { canonical: "https://tools.loresync.dev/nenrei-keisan" },
};

export default function Page() {
  return <ToolPage />;
}
