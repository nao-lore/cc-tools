import type { Metadata } from "next";
import ToolPage from "@/tools/epoch-converter/page";

export const metadata: Metadata = {
  title: "Unix Timestamp Converter - Epoch to Date & Back | epoch-converter",
  description: "Convert Unix timestamps to human-readable dates and back. Supports seconds, milliseconds, multiple formats, timezones, and quick actions. Free online epoch converter.",
  alternates: { canonical: "https://tools.loresync.dev/epoch-converter" },
};

export default function Page() {
  return <ToolPage />;
}
