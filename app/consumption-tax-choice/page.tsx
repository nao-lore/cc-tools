import type { Metadata } from "next";
import ToolPage from "@/tools/consumption-tax-choice/page";

export const metadata: Metadata = {
  title: "簡易課税 vs 本則課税 判定 — 有利な課税方式を即判定",
  description: "簡易課税と本則課税の消費税額を比較して有利な方式を即判定。みなし仕入率（業種別6区分）対応。2割特例の適用可否と節税額も計算。",
  alternates: { canonical: "https://tools.loresync.dev/consumption-tax-choice" },
};

export default function Page() {
  return <ToolPage />;
}
