import type { Metadata } from "next";
import ToolPage from "@/tools/regex-tester/page";

export const metadata: Metadata = {
  title: "Regex Tester - JavaScript Regular Expression Debugger",
  description: "Test JavaScript regular expressions with live highlighting, capture groups, replacement preview, examples, validation errors, and copyable pattern output.",
  alternates: { canonical: "https://tools.loresync.dev/regex-tester" },
};

export default function Page() {
  return <ToolPage />;
}
