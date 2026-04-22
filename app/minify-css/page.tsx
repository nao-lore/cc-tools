import type { Metadata } from "next";
import ToolPage from "@/tools/minify-css/page";

export const metadata: Metadata = {
  title: "CSS Minifier - Minify CSS Online | minify-css",
  description: "Free online CSS minifier. Paste your CSS, get minified output instantly. Remove comments, whitespace, and optimize your stylesheets. No signup required.",
  alternates: { canonical: "https://tools.loresync.dev/minify-css" },
};

export default function Page() {
  return <ToolPage />;
}
