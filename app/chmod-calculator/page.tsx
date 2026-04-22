import type { Metadata } from "next";
import ToolPage from "@/tools/chmod-calculator/page";

export const metadata: Metadata = {
  title: "Chmod Calculator - Unix File Permissions | chmod-calculator",
  description: "Free online chmod calculator. Convert between numeric and symbolic Unix file permissions. Generate chmod commands instantly with an interactive permission grid.",
  alternates: { canonical: "https://tools.loresync.dev/chmod-calculator" },
};

export default function Page() {
  return <ToolPage />;
}
