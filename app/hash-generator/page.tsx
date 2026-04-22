import type { Metadata } from "next";
import ToolPage from "@/tools/hash-generator/page";

export const metadata: Metadata = {
  title: "Hash Generator - MD5, SHA-256, SHA-512 Online | hash-generator",
  description: "Free online hash generator. Compute MD5, SHA-1, SHA-256, SHA-384, SHA-512 hashes from text or files instantly in your browser. 100% client-side, no data sent to servers.",
  alternates: { canonical: "https://tools.loresync.dev/hash-generator" },
};

export default function Page() {
  return <ToolPage />;
}
