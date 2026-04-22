import type { Metadata } from "next";
import ToolPage from "@/tools/qr-generator/page";

export const metadata: Metadata = {
  title: "QR Code Generator - Create QR Codes Free | qr-generator",
  description: "Free online QR code generator. Create QR codes for URLs, text, email, phone, WiFi, and vCard. Customize colors and size, then download as PNG or SVG instantly.",
  alternates: { canonical: "https://tools.loresync.dev/qr-generator" },
};

export default function Page() {
  return <ToolPage />;
}
