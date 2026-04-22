import type { Metadata } from "next";
import ToolPage from "@/tools/url-encoder/page";

export const metadata: Metadata = {
  title: "URL Encoder & Decoder - Encode URLs Online | url-encoder",
  description: "Free online URL encoder and decoder. Encode and decode URLs and URL components with encodeURI, encodeURIComponent, and full percent-encoding. Parse URLs, build query strings, and reference common encoded characters.",
  alternates: { canonical: "https://tools.loresync.dev/url-encoder" },
};

export default function Page() {
  return <ToolPage />;
}
