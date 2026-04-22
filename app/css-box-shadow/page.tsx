import type { Metadata } from "next";
import ToolPage from "@/tools/css-box-shadow/page";

export const metadata: Metadata = {
  title: "CSS Box Shadow Generator - Create Shadows Visually | css-box-shadow",
  description: "Free online CSS box-shadow generator with live preview. Create, customize, and copy beautiful box shadows with multiple layers, presets, and full control over offsets, blur, spread, color, and opacity.",
  alternates: { canonical: "https://tools.loresync.dev/css-box-shadow" },
};

export default function Page() {
  return <ToolPage />;
}
