import type { Metadata } from "next";
import ToolPage from "@/tools/css-flexbox/page";

export const metadata: Metadata = {
  title: "CSS Flexbox Generator - Visual Layout Builder",
  description: "Build CSS Flexbox layouts visually with container controls, child properties, live preview, reset, validation, and copy-ready CSS output.",
  alternates: { canonical: "https://tools.loresync.dev/css-flexbox" },
};

export default function Page() {
  return <ToolPage />;
}
