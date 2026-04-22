import type { Metadata } from "next";
import ToolPage from "@/tools/markdown-preview/page";

export const metadata: Metadata = {
  title: "Markdown Preview - Live Markdown Editor & Viewer | markdown-preview",
  description: "Free online Markdown preview tool. Write Markdown and see rendered HTML in real time. Supports headings, bold, italic, links, images, code blocks, tables, and more.",
  alternates: { canonical: "https://tools.loresync.dev/markdown-preview" },
};

export default function Page() {
  return <ToolPage />;
}
