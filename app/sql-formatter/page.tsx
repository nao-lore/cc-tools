import type { Metadata } from "next";
import ToolPage from "@/tools/sql-formatter/page";

export const metadata: Metadata = {
  title: "SQL Formatter - Format & Beautify SQL Online | sql-formatter",
  description: "Free online SQL formatter and beautifier. Format, indent, and syntax-highlight your SQL queries instantly. Supports SELECT, INSERT, UPDATE, DELETE, and more.",
  alternates: { canonical: "https://tools.loresync.dev/sql-formatter" },
};

export default function Page() {
  return <ToolPage />;
}
