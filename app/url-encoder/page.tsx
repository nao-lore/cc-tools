import type { Metadata } from "next";
import ToolPage from "@/tools/url-encoder/page";

export const metadata: Metadata = {
  title: "URLエンコード・デコード - URL分解・クエリ文字列生成ツール",
  description: "URL、クエリパラメータ、パス断片をエンコード・デコード。encodeURI、encodeURIComponent、厳密なパーセントエンコード、URL分解、クエリ文字列生成に対応。",
  alternates: { canonical: "https://tools.loresync.dev/url-encoder" },
};

export default function Page() {
  return <ToolPage />;
}
