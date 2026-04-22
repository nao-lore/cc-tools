import type { Metadata } from "next";
import ToolPage from "@/tools/yaml-to-json/page";

export const metadata: Metadata = {
  title: "YAML to JSON Converter - Convert YAML to JSON Online | yaml-to-json",
  description: "Free online YAML to JSON converter. Paste YAML and get JSON instantly. Bidirectional conversion, validation, formatting, and one-click copy. No signup required.",
  alternates: { canonical: "https://tools.loresync.dev/yaml-to-json" },
};

export default function Page() {
  return <ToolPage />;
}
