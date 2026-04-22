import type { Metadata } from "next";
import ToolPage from "@/tools/cron-generator/page";

export const metadata: Metadata = {
  title: "Cron Expression Generator - Build & Explain Cron Schedules | cron-generator",
  description: "Free online cron expression generator and explainer. Build cron schedules visually, get human-readable explanations, and see next run times. Supports crontab syntax.",
  alternates: { canonical: "https://tools.loresync.dev/cron-generator" },
};

export default function Page() {
  return <ToolPage />;
}
