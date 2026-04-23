import type { Metadata } from "next";
import ToolPage from "@/tools/ascii-flowchart/page";

export const metadata: Metadata = {
  title: "ASCII Flowchart Generator",
  description: "Generate ASCII art flowcharts from simple node definitions. Box-drawing characters. Perfect for READMEs. Free online tool.",
  alternates: { canonical: "https://tools.loresync.dev/ascii-flowchart" },
};

export default function Page() {
  return <ToolPage />;
}
