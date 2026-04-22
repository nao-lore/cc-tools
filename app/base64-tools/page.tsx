import type { Metadata } from "next";
import ToolPage from "@/tools/base64-tools/page";

export const metadata: Metadata = {
  title: "Base64 Encoder & Decoder - Encode & Decode Instantly | base64-tools",
  description: "Free online Base64 encoder and decoder. Encode text to Base64, decode Base64 to text, convert files and images to Base64. URL-safe mode, live conversion, 100% client-side.",
  alternates: { canonical: "https://tools.loresync.dev/base64-tools" },
};

export default function Page() {
  return <ToolPage />;
}
