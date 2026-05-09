import type { Metadata } from "next";
import ToolPage from "@/tools/menseki-keisan/page";

export const metadata: Metadata = {
  title: "面積計算ツール - 8図形・坪畳・ヘクタール変換",
  description: "正方形、長方形、三角形、円など8種類の図形の面積を計算。平方メートル、坪、畳、アール、ヘクタールへの変換とCSV出力に対応。",
  alternates: { canonical: "https://tools.loresync.dev/menseki-keisan" },
};

export default function Page() {
  return <ToolPage />;
}
