import type { Metadata } from "next";
import ToolPage from "@/tools/aws-lambda-cost/page";

export const metadata: Metadata = {
  title: "AWS Lambda 料金計算 — リクエスト数・実行時間・メモリ コストシミュレーター",
  description: "AWS Lambdaの月額料金をシミュレーション。リクエスト数・実行時間・メモリ割当量・リージョン別料金を日本語で計算。無料枠対応。",
  alternates: { canonical: "https://tools.loresync.dev/aws-lambda-cost" },
};

export default function Page() {
  return <ToolPage />;
}
