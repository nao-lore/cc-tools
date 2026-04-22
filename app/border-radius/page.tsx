import type { Metadata } from "next";
import ToolPage from "@/tools/border-radius/page";

export const metadata: Metadata = {
  title: "CSS Border Radius Generator - Visual Radius Builder | border-radius",
  description: "Free online CSS border-radius generator. Visually design rounded corners with independent corner controls, elliptical radius support, and one-click CSS copy. Presets for pill, circle, blob, and more.",
  alternates: { canonical: "https://tools.loresync.dev/border-radius" },
};

export default function Page() {
  return <ToolPage />;
}
