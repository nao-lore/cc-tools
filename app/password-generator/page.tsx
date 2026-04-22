import type { Metadata } from "next";
import ToolPage from "@/tools/password-generator/page";

export const metadata: Metadata = {
  title: "パスワード生成ツール - 安全なパスワードを自動生成",
  description: "無料のパスワード生成ツール。大文字・小文字・数字・記号を組み合わせた安全なパスワードを自動生成。パスワード強度チェック機能付き。エントロピー表示対応。",
  alternates: { canonical: "https://tools.loresync.dev/password-generator" },
};

export default function Page() {
  return <ToolPage />;
}
