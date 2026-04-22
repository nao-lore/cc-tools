import type { Metadata } from "next";
import ToolPage from "@/tools/uuid-generator/page";

export const metadata: Metadata = {
  title: "UUID Generator - Generate UUIDs Online | uuid-generator",
  description: "Free online UUID generator. Generate single or bulk UUID v4 values instantly. Supports multiple formats: standard, no dashes, uppercase, lowercase. Copy with one click.",
  alternates: { canonical: "https://tools.loresync.dev/uuid-generator" },
};

export default function Page() {
  return <ToolPage />;
}
