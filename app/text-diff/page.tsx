import type { Metadata } from "next";
import ToolPage from "@/tools/text-diff/page";

export const metadata: Metadata = {
  title: "Text Diff Tool - Compare Texts Online | text-diff",
  description: "Free online text diff tool. Compare two texts side by side, highlight added and removed lines, character-level inline diff, ignore whitespace and case options. 100% client-side.",
  alternates: { canonical: "https://tools.loresync.dev/text-diff" },
};

export default function Page() {
  return <ToolPage />;
}
