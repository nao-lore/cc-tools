import type { Metadata } from "next";
import ToolPage from "@/tools/eigyoubi/page";

export const metadata: Metadata = {
  title: "営業日数計算ツール - 日本の祝日・会社休日対応",
  description: "開始日と終了日から営業日数を計算。N営業日後の納期逆算、土日祝日除外、会社独自の休業日、結果コピーとCSV出力に対応。",
  alternates: { canonical: "https://tools.loresync.dev/eigyoubi" },
};

export default function Page() {
  return <ToolPage />;
}
