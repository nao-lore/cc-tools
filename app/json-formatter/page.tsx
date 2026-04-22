import type { Metadata } from "next";
import ToolPage from "@/tools/json-formatter/page";

export const metadata: Metadata = {
  title: "JSON Formatter & Validator - Format JSON Online | json-formatter",
  description: "Free online JSON formatter and validator. Beautify, minify, and validate JSON data instantly. Syntax highlighting, error detection with line numbers, and one-click copy.",
  alternates: { canonical: "https://tools.loresync.dev/json-formatter" },
};

export default function Page() {
  return <ToolPage />;
}
