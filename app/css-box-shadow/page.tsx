import type { Metadata } from "next";
import ToolPage from "@/tools/css-box-shadow/page";

export const metadata: Metadata = {
  title: "CSS Box Shadow Generator - Layered Shadow CSS Builder",
  description: "Create layered CSS box-shadow declarations with live preview, presets, color and opacity controls, inset mode, validation ranges, and copy output.",
  alternates: { canonical: "https://tools.loresync.dev/css-box-shadow" },
};

export default function Page() {
  return <ToolPage />;
}
