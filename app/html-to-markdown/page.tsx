import type { Metadata } from "next";
import ToolPage from "@/tools/html-to-markdown/page";

export const metadata: Metadata = {
  title: "HTML to Markdown Converter - Convert HTML to MD Online | html-to-markdown",
  description: "Free online HTML to Markdown converter. Paste HTML code and instantly get clean Markdown syntax. Supports headings, links, images, tables, code blocks, lists, and more.",
  alternates: { canonical: "https://tools.loresync.dev/html-to-markdown" },
};

export default function Page() {
  return <ToolPage />;
}
