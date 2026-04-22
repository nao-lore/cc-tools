import type { Metadata } from "next";
import ToolPage from "@/tools/image-compressor/page";

export const metadata: Metadata = {
  title: "Image Compressor - Compress JPEG, PNG, WebP Online Free | image-compressor",
  description: "Free online image compressor. Compress JPEG, PNG, and WebP images in your browser with adjustable quality, resizing, and batch support. No upload required — 100% private.",
  alternates: { canonical: "https://tools.loresync.dev/image-compressor" },
};

export default function Page() {
  return <ToolPage />;
}
