import type { Metadata } from "next";
import ToolPage from "@/tools/css-gradient/page";

export const metadata: Metadata = {
  title: "CSS Gradient Generator - Create Beautiful Gradients | css-gradient",
  description: "Free online CSS gradient generator. Create beautiful linear and radial gradients with a live preview, copy CSS code, and get Tailwind CSS classes. Design tool for developers.",
  alternates: { canonical: "https://tools.loresync.dev/css-gradient" },
};

export default function Page() {
  return <ToolPage />;
}
