import type { Metadata } from "next";
import ToolPage from "@/tools/ascii-art/page";

export const metadata: Metadata = {
  title: "ASCII Art Generator - Create Text Art Online | ascii-art",
  description: "Free online ASCII art generator. Convert text to large ASCII banner art, create text boxes, and browse pre-made decorations. Copy and paste instantly.",
  alternates: { canonical: "https://tools.loresync.dev/ascii-art" },
};

export default function Page() {
  return <ToolPage />;
}
