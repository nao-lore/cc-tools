import type { Metadata } from "next";
import ToolPage from "@/tools/tailwindconvert/page";

export const metadata: Metadata = {
  title: "Tailwind CSS Converter - CSS to Tailwind & Back | tailwindconvert",
  description: "Free online CSS to Tailwind converter. Convert plain CSS to Tailwind utility classes or Tailwind to CSS instantly. 60+ properties, live preview, 100% client-side.",
  alternates: { canonical: "https://tools.loresync.dev/tailwindconvert" },
};

export default function Page() {
  return <ToolPage />;
}
