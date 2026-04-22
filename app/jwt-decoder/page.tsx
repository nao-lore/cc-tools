import type { Metadata } from "next";
import ToolPage from "@/tools/jwt-decoder/page";

export const metadata: Metadata = {
  title: "JWT Decoder - Decode & Inspect JSON Web Tokens | jwt-decoder",
  description: "Free online JWT decoder tool. Decode, inspect, and validate JSON Web Tokens instantly in your browser. Check expiration, view claims, and compare tokens. 100% client-side, no data sent to servers.",
  alternates: { canonical: "https://tools.loresync.dev/jwt-decoder" },
};

export default function Page() {
  return <ToolPage />;
}
