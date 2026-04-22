import type { Metadata } from "next";
import ToolPage from "@/tools/aspect-ratio/page";

export const metadata: Metadata = {
  title: "Aspect Ratio Calculator - Calculate & Convert Ratios | aspect-ratio",
  description: "Free online aspect ratio calculator. Calculate, convert, and visualize aspect ratios for screens, images, and videos. Supports common presets like 16:9, 4:3, 21:9, and more.",
  alternates: { canonical: "https://tools.loresync.dev/aspect-ratio" },
};

export default function Page() {
  return <ToolPage />;
}
