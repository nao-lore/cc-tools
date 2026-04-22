import type { Metadata } from "next";
import ToolPage from "@/tools/px-to-rem/page";

export const metadata: Metadata = {
  title: "PX to REM Converter - Convert Pixels to REM | px-to-rem",
  description: "Free online PX to REM converter. Instantly convert pixels to rem and rem to px with a customizable base font size. Includes bulk converter and quick reference table.",
  alternates: { canonical: "https://tools.loresync.dev/px-to-rem" },
};

export default function Page() {
  return <ToolPage />;
}
