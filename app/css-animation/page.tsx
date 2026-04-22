import type { Metadata } from "next";
import ToolPage from "@/tools/css-animation/page";

export const metadata: Metadata = {
  title: "CSS Animation Generator - Create CSS Animations | css-animation",
  description: "Free online CSS animation generator. Create custom keyframe animations with a visual editor. Adjust timing, easing, transforms, and export production-ready CSS instantly.",
  alternates: { canonical: "https://tools.loresync.dev/css-animation" },
};

export default function Page() {
  return <ToolPage />;
}
