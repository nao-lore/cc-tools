import type { Metadata } from "next";
import ToolPage from "@/tools/json-to-csv/page";

export const metadata: Metadata = {
  title: "JSON to CSV Converter - Convert JSON to CSV Online | json-to-csv",
  description: "Free online JSON to CSV converter. Paste JSON, preview as a table, and download CSV instantly. Supports nested objects, custom delimiters, and CSV-to-JSON reverse conversion.",
  alternates: { canonical: "https://tools.loresync.dev/json-to-csv" },
};

export default function Page() {
  return <ToolPage />;
}
