import type { Metadata } from "next";
import ToolPage from "@/tools/xml-formatter/page";

export const metadata: Metadata = {
  title: "XML Formatter - Format & Validate XML Online | xml-formatter",
  description: "Free online XML formatter, beautifier, and validator. Format XML with proper indentation, syntax highlighting, and validation. Minify or pretty-print XML instantly.",
  alternates: { canonical: "https://tools.loresync.dev/xml-formatter" },
};

export default function Page() {
  return <ToolPage />;
}
