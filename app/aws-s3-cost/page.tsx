import type { Metadata } from "next";
import ToolPage from "@/tools/aws-s3-cost/page";

export const metadata: Metadata = {
  title: "AWS S3 料金計算 — ストレージ・リクエスト・転送量からコスト試算",
  description: "AWS S3の月額料金を即計算。Standard/IA/Glacier/Express各クラスの料金比較。ストレージ容量・PUT/GET回数・データ転送量から総コスト試算。",
  alternates: { canonical: "https://tools.loresync.dev/aws-s3-cost" },
};

export default function Page() {
  return <ToolPage />;
}
