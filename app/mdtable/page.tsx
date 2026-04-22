import type { Metadata } from "next";
import ToolPage from "@/tools/mdtable/page";

export const metadata: Metadata = {
  title: "Markdown Table Generator - Create Tables Instantly | mdtable",
  description: "Free online Markdown table generator. Create, edit, and export Markdown tables with a spreadsheet-like editor. Supports CSV import, column alignment, and instant copy.",
  alternates: { canonical: "https://tools.loresync.dev/mdtable" },
};

export default function Page() {
  return <ToolPage />;
}
