import type { Metadata } from "next";
import ToolPage from "@/tools/regex-tester/page";

export const metadata: Metadata = {
  title: "Regex Tester - Test Regular Expressions Online | regex-tester",
  description: "Free online regex tester and debugger. Test regular expressions in real time with match highlighting, group capture display, and replace functionality.",
  alternates: { canonical: "https://tools.loresync.dev/regex-tester" },
};

export default function Page() {
  return <ToolPage />;
}
