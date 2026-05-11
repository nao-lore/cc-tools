import type { Metadata } from "next";
import ToolPage from "@/tools/password-generator/page";

export const metadata: Metadata = {
  title: "パスワード生成ツール - Web Crypto APIで安全なランダム文字列を生成",
  description: "ブラウザ内で安全なランダムパスワードを生成。長さ、文字種、紛らわしい文字除外、生成数、エントロピー表示、コピー、TXT保存に対応。",
  alternates: { canonical: "https://tools.loresync.dev/password-generator" },
};

export default function Page() {
  return <ToolPage />;
}
