import type { Metadata } from "next";
import ToolPage from "@/tools/color-palette/page";

export const metadata: Metadata = {
  title: "Color Palette Generator - Create Beautiful Palettes | color-palette",
  description: "Free online color palette generator. Create harmonious color schemes with complementary, analogous, triadic, and monochromatic modes. Export as CSS variables, HEX, Tailwind config, or JSON.",
  alternates: { canonical: "https://tools.loresync.dev/color-palette" },
};

export default function Page() {
  return <ToolPage />;
}
