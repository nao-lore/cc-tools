"use client";

import { useState, useCallback } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Chapter {
  id: number;
  timestamp: string;
  title: string;
}

interface ValidationError {
  type: "no-zero" | "min-chapters" | "min-duration" | "invalid-timestamp" | "duplicate";
  message: string;
  rowId?: number;
}

// ─── Timestamp utilities ──────────────────────────────────────────────────────

function parseTimestamp(ts: string): number | null {
  const trimmed = ts.trim();
  // HH:MM:SS
  const hms = trimmed.match(/^(\d{1,2}):(\d{2}):(\d{2})$/);
  if (hms) {
    return parseInt(hms[1]) * 3600 + parseInt(hms[2]) * 60 + parseInt(hms[3]);
  }
  // MM:SS
  const ms = trimmed.match(/^(\d{1,2}):(\d{2})$/);
  if (ms) {
    return parseInt(ms[1]) * 60 + parseInt(ms[2]);
  }
  return null;
}

function formatTimestamp(seconds: number): string {
  if (seconds >= 3600) {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  }
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

// ─── Parse imported chapter text ──────────────────────────────────────────────

function parseChapterText(text: string): Chapter[] {
  const lines = text.split("\n").filter((l) => l.trim() !== "");
  const results: Chapter[] = [];
  let id = Date.now();

  for (const line of lines) {
    // Match "00:00 Title" or "0:00:00 Title" at start of line
    const match = line.match(/^(\d{1,2}:\d{2}(?::\d{2})?)\s+(.+)$/);
    if (match) {
      results.push({ id: id++, timestamp: match[1].trim(), title: match[2].trim() });
    }
  }

  return results;
}

// ─── Validation ───────────────────────────────────────────────────────────────

function validate(chapters: Chapter[]): ValidationError[] {
  const errors: ValidationError[] = [];

  const valid = chapters.filter((c) => c.timestamp.trim() !== "" && c.title.trim() !== "");

  // Check each timestamp is parseable
  for (const c of valid) {
    if (parseTimestamp(c.timestamp) === null) {
      errors.push({
        type: "invalid-timestamp",
        message: `無効なタイムスタンプ形式: "${c.timestamp}" (MM:SS または HH:MM:SS)`,
        rowId: c.id,
      });
    }
  }

  if (errors.length > 0) return errors;

  // Minimum 3 chapters
  if (valid.length < 3) {
    errors.push({ type: "min-chapters", message: "チャプターは最低3つ必要です（YouTube規約）" });
  }

  // First chapter must be 0:00
  const sorted = [...valid].sort((a, b) => parseTimestamp(a.timestamp)! - parseTimestamp(b.timestamp)!);
  if (sorted.length > 0 && parseTimestamp(sorted[0].timestamp) !== 0) {
    errors.push({ type: "no-zero", message: "最初のチャプターは 0:00 から始める必要があります（YouTube規約）" });
  }

  // Each chapter must be >= 10 seconds apart
  for (let i = 1; i < sorted.length; i++) {
    const prev = parseTimestamp(sorted[i - 1].timestamp)!;
    const curr = parseTimestamp(sorted[i].timestamp)!;
    if (curr - prev < 10) {
      errors.push({
        type: "min-duration",
        message: `「${sorted[i - 1].title}」と「${sorted[i].title}」の間隔が10秒未満です（YouTube規約）`,
        rowId: sorted[i].id,
      });
    }
  }

  // Duplicate timestamps
  const seen = new Map<number, string>();
  for (const c of valid) {
    const secs = parseTimestamp(c.timestamp)!;
    if (seen.has(secs)) {
      errors.push({
        type: "duplicate",
        message: `タイムスタンプが重複しています: ${c.timestamp}`,
        rowId: c.id,
      });
    } else {
      seen.set(secs, c.title);
    }
  }

  return errors;
}

// ─── Generate output ──────────────────────────────────────────────────────────

function generateOutput(chapters: Chapter[]): string {
  const valid = chapters.filter(
    (c) => c.timestamp.trim() !== "" && c.title.trim() !== "" && parseTimestamp(c.timestamp) !== null
  );
  const sorted = [...valid].sort((a, b) => parseTimestamp(a.timestamp)! - parseTimestamp(b.timestamp)!);
  return sorted.map((c) => `${formatTimestamp(parseTimestamp(c.timestamp)!)} ${c.title}`).join("\n");
}

// ─── Copy button ──────────────────────────────────────────────────────────────

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    if (!text) return;
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }, [text]);

  return (
    <button
      onClick={handleCopy}
      disabled={!text}
      className="text-xs px-3 py-1.5 rounded bg-[var(--muted)] hover:bg-[var(--border)] text-[var(--muted-fg)] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
    >
      {copied ? "コピー完了!" : "コピー"}
    </button>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

const DEFAULT_CHAPTERS: Chapter[] = [
  { id: 1, timestamp: "0:00", title: "イントロ" },
  { id: 2, timestamp: "1:30", title: "本編" },
  { id: 3, timestamp: "5:00", title: "まとめ" },
];

let nextId = 100;

export default function YoutubeChaptersGenerator() {
  const [chapters, setChapters] = useState<Chapter[]>(DEFAULT_CHAPTERS);
  const [importMode, setImportMode] = useState(false);
  const [importText, setImportText] = useState("");
  const [importError, setImportError] = useState("");

  const errors = validate(chapters);
  const output = generateOutput(chapters);
  const hasOutput = output.trim().length > 0;

  // ── Row operations ──

  const updateChapter = (id: number, field: "timestamp" | "title", value: string) => {
    setChapters((prev) => prev.map((c) => (c.id === id ? { ...c, [field]: value } : c)));
  };

  const addRow = () => {
    setChapters((prev) => [...prev, { id: nextId++, timestamp: "", title: "" }]);
  };

  const removeRow = (id: number) => {
    setChapters((prev) => prev.filter((c) => c.id !== id));
  };

  // ── Import ──

  const handleImport = () => {
    const parsed = parseChapterText(importText);
    if (parsed.length === 0) {
      setImportError("チャプターが見つかりませんでした。形式: 「0:00 タイトル」");
      return;
    }
    setChapters(parsed);
    setImportMode(false);
    setImportText("");
    setImportError("");
  };

  // ── Error row IDs for highlight ──
  const errorRowIds = new Set(errors.filter((e) => e.rowId != null).map((e) => e.rowId!));

  return (
    <div className="space-y-6">
      {/* Mode toggle */}
      <div className="flex items-center gap-3 flex-wrap">
        <span className="text-sm font-medium text-[var(--foreground)]">モード:</span>
        <div className="flex rounded-lg border border-[var(--border)] overflow-hidden">
          <button
            onClick={() => setImportMode(false)}
            className={`px-4 py-1.5 text-sm transition-colors ${
              !importMode
                ? "bg-blue-600 text-white"
                : "bg-[var(--background)] text-[var(--muted-fg)] hover:bg-[var(--muted)]"
            }`}
          >
            手動入力
          </button>
          <button
            onClick={() => setImportMode(true)}
            className={`px-4 py-1.5 text-sm transition-colors ${
              importMode
                ? "bg-blue-600 text-white"
                : "bg-[var(--background)] text-[var(--muted-fg)] hover:bg-[var(--muted)]"
            }`}
          >
            テキスト取り込み
          </button>
        </div>
      </div>

      {/* Import mode */}
      {importMode ? (
        <div className="space-y-3">
          <label className="block text-sm font-medium text-[var(--foreground)]">
            既存のチャプターテキストを貼り付け
          </label>
          <p className="text-xs text-[var(--muted-fg)]">
            形式: <code className="font-mono bg-[var(--muted)] px-1 rounded">0:00 イントロ</code>、1行1チャプター
          </p>
          <textarea
            value={importText}
            onChange={(e) => { setImportText(e.target.value); setImportError(""); }}
            rows={8}
            className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--foreground)] placeholder:text-[var(--muted-fg)] focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y font-mono"
            placeholder={"0:00 イントロ\n1:30 本編\n5:00 まとめ"}
            spellCheck={false}
          />
          {importError && (
            <p className="text-xs text-red-500">{importError}</p>
          )}
          <div className="flex gap-2">
            <button
              onClick={handleImport}
              className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm transition-colors"
            >
              取り込む
            </button>
            <button
              onClick={() => { setImportMode(false); setImportText(""); setImportError(""); }}
              className="px-4 py-1.5 rounded-lg border border-[var(--border)] bg-[var(--background)] text-[var(--muted-fg)] hover:bg-[var(--muted)] text-sm transition-colors"
            >
              キャンセル
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* Chapter rows */}
          <div className="space-y-2">
            <div className="grid grid-cols-[90px_1fr_32px] gap-2 text-xs font-medium text-[var(--muted-fg)] px-1">
              <span>タイムスタンプ</span>
              <span>チャプタータイトル</span>
              <span />
            </div>

            <div className="space-y-1.5">
              {chapters.map((chapter, idx) => {
                const hasError = errorRowIds.has(chapter.id);
                return (
                  <div
                    key={chapter.id}
                    className={`grid grid-cols-[90px_1fr_32px] gap-2 items-center rounded-lg px-1 py-0.5 ${
                      hasError ? "bg-red-50 dark:bg-red-950/20" : ""
                    }`}
                  >
                    <input
                      type="text"
                      value={chapter.timestamp}
                      onChange={(e) => updateChapter(chapter.id, "timestamp", e.target.value)}
                      placeholder="0:00"
                      className={`rounded border px-2 py-1.5 text-sm font-mono text-[var(--foreground)] bg-[var(--background)] focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                        hasError
                          ? "border-red-400 focus:ring-red-400"
                          : "border-[var(--border)]"
                      }`}
                    />
                    <input
                      type="text"
                      value={chapter.title}
                      onChange={(e) => updateChapter(chapter.id, "title", e.target.value)}
                      placeholder={idx === 0 ? "イントロ（0:00 必須）" : "チャプタータイトル"}
                      className="rounded border border-[var(--border)] px-2 py-1.5 text-sm text-[var(--foreground)] bg-[var(--background)] focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                    />
                    <button
                      onClick={() => removeRow(chapter.id)}
                      disabled={chapters.length <= 1}
                      className="w-8 h-8 flex items-center justify-center rounded text-[var(--muted-fg)] hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors disabled:opacity-20 disabled:cursor-not-allowed text-lg leading-none"
                      title="削除"
                    >
                      ×
                    </button>
                  </div>
                );
              })}
            </div>

            <button
              onClick={addRow}
              className="mt-1 text-sm px-3 py-1.5 rounded-lg border border-dashed border-[var(--border)] text-[var(--muted-fg)] hover:bg-[var(--muted)] hover:text-[var(--foreground)] transition-colors w-full"
            >
              + チャプターを追加
            </button>
          </div>

          {/* Validation errors */}
          {errors.length > 0 && (
            <div className="rounded-lg border border-red-200 bg-red-50 dark:bg-red-950/20 dark:border-red-800 px-4 py-3 space-y-1">
              <p className="text-xs font-semibold text-red-600 dark:text-red-400 mb-1">規約チェック</p>
              {errors.map((e, i) => (
                <p key={i} className="text-xs text-red-500 dark:text-red-400">
                  • {e.message}
                </p>
              ))}
            </div>
          )}

          {errors.length === 0 && hasOutput && (
            <div className="rounded-lg border border-green-200 bg-green-50 dark:bg-green-950/20 dark:border-green-800 px-4 py-2">
              <p className="text-xs text-green-600 dark:text-green-400 font-medium">
                YouTube規約に準拠しています
              </p>
            </div>
          )}

          {/* Ad placeholder */}
          <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 px-4 py-6 text-center text-xs text-gray-300">
            広告スペース
          </div>

          {/* Output */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-sm font-medium text-[var(--foreground)]">
                概要欄用チャプターテキスト
              </label>
              <CopyButton text={output} />
            </div>
            <pre className="w-full rounded-lg border border-[var(--border)] bg-[var(--muted)] px-4 py-3 text-sm font-mono text-[var(--foreground)] overflow-x-auto whitespace-pre leading-relaxed min-h-[100px]">
              {hasOutput ? (
                output
              ) : (
                <span className="text-[var(--muted-fg)] text-xs not-italic italic">
                  チャプターを入力するとここに表示されます...
                </span>
              )}
            </pre>
            <p className="text-xs text-[var(--muted-fg)]">
              タイムスタンプは自動ソートされます。YouTube概要欄にそのまま貼り付けてください。
            </p>
          </div>
        </>
      )}
    </div>
  );
}
