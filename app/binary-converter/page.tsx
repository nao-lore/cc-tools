import type { Metadata } from "next";
import ToolPage from "@/tools/binary-converter/page";

export const metadata: Metadata = {
  title: "Binary Converter - Binary, Decimal, Hex, Octal | binary-converter",
  description: "Free online binary converter. Convert between binary, decimal, hexadecimal, and octal instantly. Supports negative numbers, bit visualization, and ASCII reference.",
  alternates: { canonical: "https://tools.loresync.dev/binary-converter" },
};

export default function Page() {
  return <ToolPage />;
}
