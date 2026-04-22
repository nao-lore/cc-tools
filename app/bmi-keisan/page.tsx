import type { Metadata } from "next";
import ToolPage from "@/tools/bmi-keisan/page";

export const metadata: Metadata = {
  title: "BMI計算 - 肥満度判定ツール",
  description: "身長と体重からBMI値を計算し、日本肥満学会の基準で肥満度を判定。標準体重・理想体重も表示。",
  alternates: { canonical: "https://tools.loresync.dev/bmi-keisan" },
};

export default function Page() {
  return <ToolPage />;
}
