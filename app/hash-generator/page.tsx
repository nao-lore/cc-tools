import type { Metadata } from "next";
import ToolPage from "@/tools/hash-generator/page";

export const metadata: Metadata = {
  title: "Hash Generator - MD5/SHA-1/SHA-256/SHA-512をブラウザ内で生成",
  description: "テキストやファイルからMD5、SHA-1、SHA-256、SHA-384、SHA-512を生成。コピー、TXT出力、ハッシュ比較に対応。入力データは外部送信されません。",
  alternates: { canonical: "https://tools.loresync.dev/hash-generator" },
};

export default function Page() {
  return <ToolPage />;
}
