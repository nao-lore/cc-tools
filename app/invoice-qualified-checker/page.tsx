import type { Metadata } from "next";
import ToolPage from "@/tools/invoice-qualified-checker/page";

export const metadata: Metadata = {
  title: "適格請求書（インボイス）チェッカー — 必須記載項目の確認ツール",
  description: "インボイス制度の適格請求書に必要な6項目をチェックリスト形式で確認。登録番号の形式チェック、税率別消費税額の計算補助付き。無料・登録不要。",
  alternates: { canonical: "https://tools.loresync.dev/invoice-qualified-checker" },
};

export default function Page() {
  return <ToolPage />;
}
