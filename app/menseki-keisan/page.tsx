import type { Metadata } from "next";
import ToolPage from "@/tools/menseki-keisan/page";

export const metadata: Metadata = {
  title: "面積計算 - 8図形対応・坪畳変換",
  description: "正方形・長方形・三角形・円など8図形の面積と周囲長を計算。坪・畳・ヘクタールへの単位変換付き。",
  alternates: { canonical: "https://tools.loresync.dev/menseki-keisan" },
};

export default function Page() {
  return <ToolPage />;
}
