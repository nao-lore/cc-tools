import type { Metadata } from "next";
import ToolPage from "@/tools/color-palette/page";

export const metadata: Metadata = {
  title: "Color Palette Generator - Accessible Palettes and Design Tokens",
  description: "Generate accessible color palettes, lock swatches, tune HSL values, check contrast, and export CSS variables, HEX arrays, Tailwind config, or JSON.",
  alternates: { canonical: "https://tools.loresync.dev/color-palette" },
};

export default function Page() {
  return <ToolPage />;
}
