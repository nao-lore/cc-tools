import type { Metadata } from "next";
import ToolPage from "@/tools/placeholder-image/page";

export const metadata: Metadata = {
  title: "Placeholder Image Generator - Custom PNG, JPEG, and WebP placeholders",
  description: "Create exact-size placeholder images locally with custom dimensions, colors, text, rounded corners, PNG/JPEG/WebP download, data URI copy, and img tag export.",
  alternates: { canonical: "https://tools.loresync.dev/placeholder-image" },
};

export default function Page() {
  return <ToolPage />;
}
