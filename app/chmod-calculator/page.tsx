import type { Metadata } from "next";
import ToolPage from "@/tools/chmod-calculator/page";

export const metadata: Metadata = {
  title: "Chmod Calculator - Unix File Permissions and chmod Command Generator",
  description: "Convert Unix file permissions between numeric, symbolic, and command formats. Toggle read, write, execute, setuid, setgid, and sticky bits locally in your browser.",
  alternates: { canonical: "https://tools.loresync.dev/chmod-calculator" },
};

export default function Page() {
  return <ToolPage />;
}
