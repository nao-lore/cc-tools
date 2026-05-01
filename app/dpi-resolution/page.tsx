import type { Metadata } from "next";
import ToolPage from "@/tools/dpi-resolution/page";

export const metadata: Metadata = {
  title: "DPI 解像度 印刷サイズ計算 — ピクセル↔印刷サイズの相互変換",
  description: "DPI・解像度・印刷サイズの相互変換ツール。ピクセル数から印刷可能サイズ、印刷サイズから必要ピクセル数を即計算。推奨DPI（300/150/72）対応。",
  alternates: { canonical: "https://tools.loresync.dev/dpi-resolution" },
};

export default function Page() {
  return <ToolPage />;
}
