import type { Metadata } from "next";
import ToolPage from "@/tools/css-grid/page";

export const metadata: Metadata = {
  title: "CSS Grid Generator - Visual Grid Layout Builder | css-grid",
  description: "Free online CSS Grid generator. Visually build grid layouts with configurable columns, rows, gaps, and template areas. Copy production-ready CSS instantly.",
  alternates: { canonical: "https://tools.loresync.dev/css-grid" },
};

export default function Page() {
  return <ToolPage />;
}
