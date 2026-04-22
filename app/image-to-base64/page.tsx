import type { Metadata } from "next";
import ToolPage from "@/tools/image-to-base64/page";

export const metadata: Metadata = {
  title: "Image to Base64 Converter - Encode Images Online | image-to-base64",
  description: "Free online image to Base64 converter. Drag and drop images to encode them as Base64 strings, Data URIs, CSS backgrounds, or HTML img tags. Supports PNG, JPG, GIF, SVG, WebP, and ICO.",
  alternates: { canonical: "https://tools.loresync.dev/image-to-base64" },
};

export default function Page() {
  return <ToolPage />;
}
