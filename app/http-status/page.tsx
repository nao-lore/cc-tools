import type { Metadata } from "next";
import ToolPage from "@/tools/http-status/page";

export const metadata: Metadata = {
  title: "HTTP Status Codes - Complete Reference Guide | http-status",
  description: "Complete HTTP status code reference. Look up any HTTP response code with descriptions, examples, and when you encounter them. Covers 1xx, 2xx, 3xx, 4xx, and 5xx codes.",
  alternates: { canonical: "https://tools.loresync.dev/http-status" },
};

export default function Page() {
  return <ToolPage />;
}
