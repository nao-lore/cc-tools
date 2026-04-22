import type { Metadata } from "next";
import ToolPage from "@/tools/minify-js/page";

export const metadata: Metadata = {
  title: "JavaScript Minifier - Minify JS Online | minify-js",
  description: "Free online JavaScript minifier. Paste your JS code and get a minified version instantly. Remove comments, whitespace, and reduce file size with one click.",
  alternates: { canonical: "https://tools.loresync.dev/minify-js" },
};

export default function Page() {
  return <ToolPage />;
}
