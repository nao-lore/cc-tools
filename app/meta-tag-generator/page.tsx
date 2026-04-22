import type { Metadata } from "next";
import ToolPage from "@/tools/meta-tag-generator/page";

export const metadata: Metadata = {
  title: "Meta Tag Generator - Generate HTML Meta Tags | meta-tag-generator",
  description: "Free online meta tag generator. Create HTML meta tags, Open Graph tags, and Twitter Card tags for better SEO. Live preview of Google, Facebook, and Twitter snippets.",
  alternates: { canonical: "https://tools.loresync.dev/meta-tag-generator" },
};

export default function Page() {
  return <ToolPage />;
}
