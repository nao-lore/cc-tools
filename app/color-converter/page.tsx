import type { Metadata } from "next";
import ToolPage from "@/tools/color-converter/page";

export const metadata: Metadata = {
  title: "Color Converter - HEX, RGB, HSL, CMYK | color-converter",
  description: "Free online color converter tool. Convert colors between HEX, RGB, HSL, and CMYK formats instantly. Visual color picker, WCAG contrast checker, and closest CSS color name lookup.",
  alternates: { canonical: "https://tools.loresync.dev/color-converter" },
};

export default function Page() {
  return <ToolPage />;
}
