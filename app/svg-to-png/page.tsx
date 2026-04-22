import type { Metadata } from "next";
import ToolPage from "@/tools/svg-to-png/page";

export const metadata: Metadata = {
  title: "SVG to PNG Converter - Convert SVG to PNG Online Free | svg-to-png",
  description: "Free online SVG to PNG converter. Paste SVG code or upload SVG files and convert them to high-resolution PNG images instantly. Supports custom resolution, transparent backgrounds, and batch conversion. No upload to server - 100% client-side.",
  alternates: { canonical: "https://tools.loresync.dev/svg-to-png" },
};

export default function Page() {
  return <ToolPage />;
}
