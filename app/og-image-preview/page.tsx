import type { Metadata } from "next";
import ToolPage from "@/tools/og-image-preview/page";

export const metadata: Metadata = {
  title: "OG Image Preview - Open Graph Debugger & Preview | og-image-preview",
  description: "Free Open Graph image preview and debugger. Preview how your links appear on Facebook, Twitter, LinkedIn, Discord, and Slack before sharing. Check OG meta tags instantly.",
  alternates: { canonical: "https://tools.loresync.dev/og-image-preview" },
};

export default function Page() {
  return <ToolPage />;
}
