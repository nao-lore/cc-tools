import type { Metadata } from "next";
import ToolPage from "@/tools/robots-txt-generator/page";

export const metadata: Metadata = {
  title: "Robots.txt Generator - Create robots.txt File | robots-txt-generator",
  description: "Free online robots.txt generator. Create, validate, and download robots.txt files for your website. Configure user-agent rules, sitemaps, crawl-delay, and more.",
  alternates: { canonical: "https://tools.loresync.dev/robots-txt-generator" },
};

export default function Page() {
  return <ToolPage />;
}
