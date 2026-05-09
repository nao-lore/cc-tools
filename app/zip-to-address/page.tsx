import type { Metadata } from "next";
import ToolPage from "@/tools/zip-to-address/page";

export const metadata: Metadata = {
  title: "郵便番号→住所変換ツール",
  description: "7桁郵便番号から都道府県・市区町村・町域を検索。住所から郵便番号の逆引きも。無料ツール。",
  alternates: { canonical: "https://tools.loresync.dev/zip-to-address" },
};

export default function Page() {
  return <ToolPage />;
}
