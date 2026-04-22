import type { Metadata } from "next";
import ToolPage from "@/tools/html-entity/page";

export const metadata: Metadata = {
  title: "HTML Entity Encoder/Decoder - Convert HTML Entities | html-entity",
  description: "Free online HTML entity encoder and decoder. Convert special characters to HTML entities and decode HTML entities back to readable text. Supports named, numeric, and hex entities.",
  alternates: { canonical: "https://tools.loresync.dev/html-entity" },
};

export default function Page() {
  return <ToolPage />;
}
