import type { Metadata } from "next";
import ToolPage from "@/tools/ai-coding-tool-comparison/page";

export const metadata: Metadata = {
  title: "AIコーディングツール比較 — Cursor / Copilot / Windsurf / Claude Code 料金・機能一覧",
  description: "Cursor、GitHub Copilot、Windsurf、Claude Code、Aider、Clineの料金・機能・対応モデル・リクエスト上限を一覧比較。用途別おすすめ付き。2026年最新版。",
  alternates: { canonical: "https://tools.loresync.dev/ai-coding-tool-comparison" },
};

export default function Page() {
  return <ToolPage />;
}
