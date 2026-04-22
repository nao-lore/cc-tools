import type { Metadata } from "next";
import ToolPage from "@/tools/favicon-generator/page";

export const metadata: Metadata = {
  title: "Favicon Generator - Create Favicons from Text, Emoji or Image",
  description: "Free online favicon generator. Create favicons from text, emoji, or uploaded images. Download as ICO, PNG in all sizes (16x16 to 512x512). Get HTML meta tags for easy integration.",
  alternates: { canonical: "https://tools.loresync.dev/favicon-generator" },
};

export default function Page() {
  return <ToolPage />;
}
