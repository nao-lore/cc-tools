import type { Metadata } from "next";
import ToolPage from "@/tools/dummy-text/page";

export const metadata: Metadata = {
  title: "Placeholder Text Generator - Generate Dummy Text | dummy-text",
  description: "Free online placeholder text generator for designers and developers. Generate dummy text in multiple styles including standard filler, technical jargon, and business speak. Copy with one click.",
  alternates: { canonical: "https://tools.loresync.dev/dummy-text" },
};

export default function Page() {
  return <ToolPage />;
}
