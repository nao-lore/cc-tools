import type { Metadata } from "next";
import ToolPage from "@/tools/timezone-converter/page";

export const metadata: Metadata = {
  title: "Time Zone Converter - Convert Time Between Zones | timezone-converter",
  description: "Free online time zone converter. Convert time between any time zones worldwide. Compare multiple zones, check DST status, and find the current time anywhere.",
  alternates: { canonical: "https://tools.loresync.dev/timezone-converter" },
};

export default function Page() {
  return <ToolPage />;
}
