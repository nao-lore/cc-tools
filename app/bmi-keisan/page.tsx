import type { Metadata } from "next";
import ToolPage from "@/tools/bmi-keisan/page";

export const metadata: Metadata = {
  title: "BMI計算ツール - 肥満度・標準体重・普通体重範囲を確認",
  description: "身長と体重からBMI、肥満度、標準体重、普通体重の範囲を計算。日本肥満学会の判定基準に沿った成人向けの確認ツール。",
  alternates: { canonical: "https://tools.loresync.dev/bmi-keisan" },
};

export default function Page() {
  return <ToolPage />;
}
