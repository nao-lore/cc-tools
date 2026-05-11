import type { Metadata } from "next";
import ToolPage from "@/tools/border-radius/page";

export const metadata: Metadata = {
  title: "CSS Border Radius Generator - Visual Corner Radius Builder",
  description: "Design border-radius CSS visually with linked corners, independent controls, elliptical radii, presets, preview customization, and copy output.",
  alternates: { canonical: "https://tools.loresync.dev/border-radius" },
};

export default function Page() {
  return <ToolPage />;
}
