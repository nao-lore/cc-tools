import type { Metadata } from "next";
import ToolPage from "@/tools/css-flexbox/page";

export const metadata: Metadata = {
  title: "CSS Flexbox Generator - Visual Flexbox Builder | css-flexbox",
  description: "Free online CSS Flexbox generator. Visually build flex layouts with a live preview, per-child controls, and instant CSS output. No signup required.",
  alternates: { canonical: "https://tools.loresync.dev/css-flexbox" },
};

export default function Page() {
  return <ToolPage />;
}
