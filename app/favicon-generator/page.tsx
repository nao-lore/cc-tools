import type { Metadata } from "next";
import ToolPage from "@/tools/favicon-generator/page";

export const metadata: Metadata = {
  title: "Favicon Generator - Create ICO, PNG, Apple Touch and PWA Icons",
  description: "Create favicons from text, emoji, or local images. Preview small sizes, download favicon.ico and PNG files, and copy HTML install tags without uploading files.",
  alternates: { canonical: "https://tools.loresync.dev/favicon-generator" },
};

export default function Page() {
  return <ToolPage />;
}
