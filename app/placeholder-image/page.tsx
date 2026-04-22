import type { Metadata } from "next";
import ToolPage from "@/tools/placeholder-image/page";

export const metadata: Metadata = {
  title: "Placeholder Image Generator - Create Placeholder Images | placeholder-image",
  description: "Free online placeholder image generator. Create custom placeholder images with configurable dimensions, colors, text, and formats. Download as PNG, JPEG, or WebP.",
  alternates: { canonical: "https://tools.loresync.dev/placeholder-image" },
};

export default function Page() {
  return <ToolPage />;
}
