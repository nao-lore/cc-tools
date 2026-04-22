import type { Metadata } from "next";
import ToolPage from "@/tools/eigyoubi/page";

export const metadata: Metadata = {
  title: "営業日数計算ツール - 日本の祝日対応 | eigyoubi",
  description: "営業日数を簡単に計算できる無料ツール。日本の祝日・振替休日に完全対応。期間指定・逆算の2モードでビジネスの日程計画をサポートします。",
  alternates: { canonical: "https://tools.loresync.dev/eigyoubi" },
};

export default function Page() {
  return <ToolPage />;
}
