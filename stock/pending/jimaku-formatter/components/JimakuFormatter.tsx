"use client";

import { useState, useCallback } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

type OutputFormat = "srt" | "vtt";
type AppMode = "create" | "reformat";

interface SubtitleRow {
  id: string;
  startTime: string;
  endTime: string;
  text: string;
}

interface ValidationError {
  index: number;
  message: string;
}

// ─── Timecode helpers ─────────────────────────────────────────────────────────

function parseTimecode(tc: string): number | null {
  // Accept HH:MM:SS,mmm or HH:MM:SS.mmm or MM:SS,mmm or MM:SS.mmm
  const normalized = tc.trim().replace(".", ",");
  const match = normalized.match(/^(?:(\d{1,2}):)?(\d{1,2}):(\d{2}),(\d{3})$/);
  if (!match) return null;
  const h = parseInt(match[1] ?? "0", 10);
  const m = parseInt(match[2], 10);
  const s = parseInt(match[3], 10);
  const ms = parseInt(match[4], 10);
  return h * 3600000 + m * 60000 + s * 1000 + ms;
}

function msToSrtTime(ms: number): string {
  const h = Math.floor(ms / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);
  const s = Math.floor((ms % 60000) / 1000);
  const msPart = ms % 1000;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")},${String(msPart).padStart(3, "0")}`;
}

function msToVttTime(ms: number): string {
  return msToSrtTime(ms).replace(",", ".");
}

function formatTime(ms: number, fmt: OutputFormat): string {
  return fmt === "srt" ? msToSrtTime(ms) : msToVttTime(ms);
}

// ─── SRT/VTT parsing ──────────────────────────────────────────────────────────

interface ParsedSubtitle {
  index: number;
  startMs: number;
  endMs: number;
  text: string;
  rawStart: string;
  rawEnd: string;
}

function parseSrtOrVtt(raw: string): { subtitles: ParsedSubtitle[]; errors: string[] } {
  const text = raw.trim();
  const isVtt = text.startsWith("WEBVTT");
  const errors: string[] = [];
  const subtitles: ParsedSubtitle[] = [];

  // Strip WEBVTT header
  const body = isVtt ? text.replace(/^WEBVTT[^\n]*\n+/, "") : text;

  // Split into blocks (blank-line separated)
  const blocks = body.split(/\n\s*\n/).map((b) => b.trim()).filter(Boolean);

  let idx = 0;
  for (const block of blocks) {
    const lines = block.split("\n").map((l) => l.trim());
    let lineIdx = 0;

    // Skip numeric index line in SRT
    if (!isVtt && /^\d+$/.test(lines[0])) {
      lineIdx = 1;
    }
    // Skip cue identifier in VTT (non-timecode line before timecode)
    if (isVtt && lines[0] && !lines[0].includes("-->")) {
      lineIdx = 1;
    }

    const timecodeLine = lines[lineIdx];
    if (!timecodeLine || !timecodeLine.includes("-->")) {
      errors.push(`ブロック${idx + 1}: タイムコード行が見つかりません`);
      idx++;
      continue;
    }

    const parts = timecodeLine.split("-->").map((p) => p.trim().split(/\s/)[0]);
    const rawStart = parts[0];
    const rawEnd = parts[1];
    const startMs = parseTimecode(rawStart);
    const endMs = parseTimecode(rawEnd);

    if (startMs === null) {
      errors.push(`ブロック${idx + 1}: 開始タイムコードの形式が不正です (${rawStart})`);
    }
    if (endMs === null) {
      errors.push(`ブロック${idx + 1}: 終了タイムコードの形式が不正です (${rawEnd})`);
    }

    const textLines = lines.slice(lineIdx + 1).filter(Boolean);
    const subtitleText = textLines.join("\n");

    subtitles.push({
      index: idx + 1,
      startMs: startMs ?? 0,
      endMs: endMs ?? 0,
      text: subtitleText,
      rawStart,
      rawEnd,
    });
    idx++;
  }

  return { subtitles, errors };
}

// ─── Validation ───────────────────────────────────────────────────────────────

function validateSubtitles(subs: ParsedSubtitle[]): ValidationError[] {
  const errors: ValidationError[] = [];

  for (let i = 0; i < subs.length; i++) {
    const sub = subs[i];

    if (!sub.text.trim()) {
      errors.push({ index: sub.index, message: "字幕テキストが空です" });
    }

    if (sub.startMs >= sub.endMs) {
      errors.push({ index: sub.index, message: `開始時刻 ≥ 終了時刻 (${sub.rawStart} → ${sub.rawEnd})` });
    }

    if (i > 0 && sub.startMs < subs[i - 1].endMs) {
      errors.push({
        index: sub.index,
        message: `前の字幕と重複しています (${msToSrtTime(subs[i - 1].endMs)} まで表示中)`,
      });
    }

    const lines = sub.text.split("\n");
    for (const line of lines) {
      if (line.length > 42) {
        errors.push({
          index: sub.index,
          message: `1行が42文字を超えています (${line.length}文字): "${line.slice(0, 20)}..."`,
        });
        break;
      }
    }
  }

  return errors;
}

// ─── Output generation ────────────────────────────────────────────────────────

function generateSrt(subs: ParsedSubtitle[]): string {
  return subs
    .map((s, i) => `${i + 1}\n${msToSrtTime(s.startMs)} --> ${msToSrtTime(s.endMs)}\n${s.text}`)
    .join("\n\n");
}

function generateVtt(subs: ParsedSubtitle[]): string {
  const body = subs
    .map((s) => `${msToVttTime(s.startMs)} --> ${msToVttTime(s.endMs)}\n${s.text}`)
    .join("\n\n");
  return `WEBVTT\n\n${body}`;
}

function generateFromRows(rows: SubtitleRow[], fmt: OutputFormat): string {
  const parsed: ParsedSubtitle[] = [];
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const startMs = parseTimecode(row.startTime) ?? 0;
    const endMs = parseTimecode(row.endTime) ?? 0;
    parsed.push({ index: i + 1, startMs, endMs, text: row.text, rawStart: row.startTime, rawEnd: row.endTime });
  }
  return fmt === "srt" ? generateSrt(parsed) : generateVtt(parsed);
}

function validateRows(rows: SubtitleRow[]): ValidationError[] {
  const errors: ValidationError[] = [];
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const startMs = parseTimecode(row.startTime);
    const endMs = parseTimecode(row.endTime);

    if (startMs === null) {
      errors.push({ index: i + 1, message: `開始タイムコードの形式が不正です` });
    }
    if (endMs === null) {
      errors.push({ index: i + 1, message: `終了タイムコードの形式が不正です` });
    }
    if (startMs !== null && endMs !== null && startMs >= endMs) {
      errors.push({ index: i + 1, message: `開始時刻 ≥ 終了時刻` });
    }
    if (!row.text.trim()) {
      errors.push({ index: i + 1, message: `字幕テキストが空です` });
    }
    const lines = row.text.split("\n");
    for (const line of lines) {
      if (line.length > 42) {
        errors.push({ index: i + 1, message: `1行が42文字を超えています (${line.length}文字)` });
        break;
      }
    }
  }
  return errors;
}

// ─── Download helper ──────────────────────────────────────────────────────────

function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

// ─── CopyButton ───────────────────────────────────────────────────────────────

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
      {copied ? "コピー済み!" : "コピー"}
    </button>
  );
}

// ─── TimecodeInput ────────────────────────────────────────────────────────────

function TimecodeInput({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
}) {
  const isValid = value === "" || parseTimecode(value) !== null;
  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={`w-36 rounded border px-2 py-1 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-blue-500 bg-[var(--background)] text-[var(--foreground)] ${
        isValid ? "border-[var(--border)]" : "border-red-500"
      }`}
      spellCheck={false}
    />
  );
}

// ─── CreateMode ───────────────────────────────────────────────────────────────

function CreateMode({
  format,
  onFormatChange,
}: {
  format: OutputFormat;
  onFormatChange: (f: OutputFormat) => void;
}) {
  const [rows, setRows] = useState<SubtitleRow[]>([
    { id: "1", startTime: "00:00:01,000", endTime: "00:00:04,000", text: "字幕テキストをここに入力" },
    { id: "2", startTime: "00:00:05,000", endTime: "00:00:08,500", text: "2行目の字幕テキスト" },
  ]);

  const addRow = () => {
    const last = rows[rows.length - 1];
    const lastEndMs = last ? (parseTimecode(last.endTime) ?? 0) : 0;
    const newStart = msToSrtTime(lastEndMs + 1000);
    const newEnd = msToSrtTime(lastEndMs + 4000);
    setRows((prev) => [
      ...prev,
      { id: String(Date.now()), startTime: newStart, endTime: newEnd, text: "" },
    ]);
  };

  const removeRow = (id: string) => {
    setRows((prev) => prev.filter((r) => r.id !== id));
  };

  const updateRow = (id: string, field: keyof SubtitleRow, value: string) => {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, [field]: value } : r)));
  };

  const errors = validateRows(rows);
  const hasErrors = errors.length > 0;
  const output = rows.length > 0 ? generateFromRows(rows, format) : "";

  const handleDownload = () => {
    const ext = format === "srt" ? "srt" : "vtt";
    const mime = format === "srt" ? "text/plain" : "text/vtt";
    downloadFile(output, `subtitles.${ext}`, mime);
  };

  return (
    <div className="space-y-4">
      {/* Row editor */}
      <div className="bg-surface rounded-2xl border border-border p-4 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-[var(--foreground)]">字幕行の編集</span>
          <button
            onClick={addRow}
            className="text-xs px-3 py-1.5 rounded-lg bg-[var(--muted)] hover:bg-[var(--border)] text-[var(--muted-fg)] transition-colors"
          >
            + 行を追加
          </button>
        </div>

        <div className="space-y-2">
          {/* Header */}
          <div className="grid grid-cols-[2rem_1fr_1fr_2fr_2rem] gap-2 text-xs text-muted text-[var(--muted-fg)] px-1">
            <span>#</span>
            <span>開始 (HH:MM:SS,mmm)</span>
            <span>終了 (HH:MM:SS,mmm)</span>
            <span>字幕テキスト</span>
            <span />
          </div>

          {rows.map((row, i) => {
            const rowErrors = errors.filter((e) => e.index === i + 1);
            return (
              <div key={row.id} className="space-y-1">
                <div className="grid grid-cols-[2rem_1fr_1fr_2fr_2rem] gap-2 items-start">
                  <span className="text-xs text-[var(--muted-fg)] pt-1.5 text-right">{i + 1}</span>
                  <TimecodeInput
                    value={row.startTime}
                    onChange={(v) => updateRow(row.id, "startTime", v)}
                    placeholder="00:00:00,000"
                  />
                  <TimecodeInput
                    value={row.endTime}
                    onChange={(v) => updateRow(row.id, "endTime", v)}
                    placeholder="00:00:00,000"
                  />
                  <textarea
                    value={row.text}
                    onChange={(e) => updateRow(row.id, "text", e.target.value)}
                    rows={2}
                    placeholder="字幕テキスト"
                    className="w-full rounded border border-[var(--border)] bg-[var(--background)] px-2 py-1 text-xs text-[var(--foreground)] focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none"
                  />
                  <button
                    onClick={() => removeRow(row.id)}
                    disabled={rows.length <= 1}
                    className="text-[var(--muted-fg)] hover:text-red-500 disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-sm pt-1"
                  >
                    ×
                  </button>
                </div>
                {rowErrors.length > 0 && (
                  <div className="col-span-5 ml-8 space-y-0.5">
                    {rowErrors.map((e, ei) => (
                      <p key={ei} className="text-xs text-red-500">
                        {e.message}
                      </p>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Output */}
      <OutputPanel
        output={output}
        format={format}
        onFormatChange={onFormatChange}
        hasErrors={hasErrors}
        onDownload={handleDownload}
        subtitles={null}
      />
    </div>
  );
}

// ─── ReformatMode ─────────────────────────────────────────────────────────────

function ReformatMode({
  format,
  onFormatChange,
}: {
  format: OutputFormat;
  onFormatChange: (f: OutputFormat) => void;
}) {
  const [inputText, setInputText] = useState("");

  const { subtitles, errors: parseErrors } = inputText.trim()
    ? parseSrtOrVtt(inputText)
    : { subtitles: [], errors: [] };

  const validationErrors = validateSubtitles(subtitles);
  const allErrors = [...parseErrors.map((m) => ({ index: 0, message: m })), ...validationErrors];

  const output =
    subtitles.length > 0
      ? format === "srt"
        ? generateSrt(subtitles)
        : generateVtt(subtitles)
      : "";

  const handleDownload = () => {
    const ext = format === "srt" ? "srt" : "vtt";
    const mime = format === "srt" ? "text/plain" : "text/vtt";
    downloadFile(output, `reformatted.${ext}`, mime);
  };

  return (
    <div className="space-y-4">
      {/* Input */}
      <div className="bg-surface rounded-2xl border border-border p-4 space-y-2">
        <label className="block text-sm font-medium text-[var(--foreground)]">
          SRT / VTT テキストを貼り付け
        </label>
        <textarea
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          rows={12}
          placeholder={"1\n00:00:01,000 --> 00:00:04,000\n字幕テキスト\n\n2\n00:00:05,000 --> 00:00:08,000\n次の字幕..."}
          className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm font-mono text-[var(--foreground)] placeholder:text-[var(--muted-fg)] focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y"
          spellCheck={false}
        />
        {subtitles.length > 0 && (
          <p className="text-xs text-[var(--muted-fg)]">
            {subtitles.length} 件の字幕を検出しました
          </p>
        )}
      </div>

      {/* Validation errors */}
      {allErrors.length > 0 && (
        <div className="bg-surface rounded-2xl border border-border p-4 space-y-2">
          <p className="text-sm font-medium text-red-500">バリデーション結果</p>
          <ul className="space-y-1">
            {allErrors.map((e, i) => (
              <li key={i} className="text-xs text-red-500 flex gap-2">
                {e.index > 0 && (
                  <span className="shrink-0 font-mono bg-red-50 dark:bg-red-950 px-1 rounded">
                    #{e.index}
                  </span>
                )}
                <span>{e.message}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Preview */}
      {subtitles.length > 0 && (
        <div className="bg-surface rounded-2xl border border-border p-4 space-y-2">
          <p className="text-sm font-medium text-[var(--foreground)]">プレビュー</p>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {subtitles.map((s) => (
              <div key={s.index} className="flex gap-3 text-xs">
                <span className="shrink-0 font-mono text-[var(--muted-fg)] w-5 text-right">
                  {s.index}
                </span>
                <span className="shrink-0 font-mono text-[var(--muted-fg)]">
                  {msToSrtTime(s.startMs)} → {msToSrtTime(s.endMs)}
                </span>
                <span className="text-[var(--foreground)] whitespace-pre-wrap">{s.text}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <OutputPanel
        output={output}
        format={format}
        onFormatChange={onFormatChange}
        hasErrors={false}
        onDownload={handleDownload}
        subtitles={subtitles}
      />
    </div>
  );
}

// ─── OutputPanel ──────────────────────────────────────────────────────────────

function OutputPanel({
  output,
  format,
  onFormatChange,
  hasErrors,
  onDownload,
  subtitles,
}: {
  output: string;
  format: OutputFormat;
  onFormatChange: (f: OutputFormat) => void;
  hasErrors: boolean;
  onDownload: () => void;
  subtitles: ParsedSubtitle[] | null;
}) {
  return (
    <div className="bg-surface rounded-2xl border border-border p-4 space-y-3">
      {/* Format toggle + actions */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-[var(--foreground)]">出力形式</span>
          <div className="flex rounded-lg border border-[var(--border)] overflow-hidden">
            {(["srt", "vtt"] as OutputFormat[]).map((f) => (
              <button
                key={f}
                onClick={() => onFormatChange(f)}
                className={`px-4 py-1.5 text-sm font-mono transition-colors ${
                  format === f
                    ? "bg-accent text-white"
                    : "bg-[var(--background)] text-[var(--muted-fg)] hover:bg-[var(--muted)]"
                }`}
              >
                .{f}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <CopyButton text={output} />
          <button
            onClick={onDownload}
            disabled={!output || hasErrors}
            className="text-xs px-3 py-1.5 rounded bg-accent text-white hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-opacity"
          >
            ダウンロード .{format}
          </button>
        </div>
      </div>

      {/* Output textarea */}
      <pre className="w-full rounded-lg border border-[var(--border)] bg-[var(--muted)] px-4 py-3 text-xs font-mono text-[var(--foreground)] overflow-x-auto whitespace-pre leading-relaxed min-h-[120px] max-h-64 overflow-y-auto">
        {output || (
          <span className="text-[var(--muted-fg)] italic not-italic">
            出力はここに表示されます...
          </span>
        )}
      </pre>

      {/* Stats */}
      {subtitles && subtitles.length > 0 && (
        <p className="text-xs text-[var(--muted-fg)]">
          {subtitles.length} 件 · 合計時間:{" "}
          {formatTime(Math.max(...subtitles.map((s) => s.endMs)), "srt")}
        </p>
      )}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function JimakuFormatter() {
  const [mode, setMode] = useState<AppMode>("create");
  const [format, setFormat] = useState<OutputFormat>("srt");

  return (
    <div className="space-y-6">
      {/* Mode toggle */}
      <div className="flex items-center gap-3">
        <span className="text-sm font-medium text-[var(--foreground)]">モード</span>
        <div className="flex rounded-lg border border-[var(--border)] overflow-hidden">
          {([
            { value: "create" as AppMode, label: "新規作成" },
            { value: "reformat" as AppMode, label: "整形・バリデーション" },
          ] as const).map(({ value, label }) => (
            <button
              key={value}
              onClick={() => setMode(value)}
              className={`px-4 py-1.5 text-sm transition-colors ${
                mode === value
                  ? "bg-accent text-white"
                  : "bg-[var(--background)] text-[var(--muted-fg)] hover:bg-[var(--muted)]"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Mode content */}
      {mode === "create" ? (
        <CreateMode format={format} onFormatChange={setFormat} />
      ) : (
        <ReformatMode format={format} onFormatChange={setFormat} />
      )}

      {/* Ad placeholder */}
      <div className="bg-surface rounded-2xl border border-border p-4 flex items-center justify-center h-20 text-xs text-[var(--muted-fg)]">
        広告スペース
      </div>
    </div>
  );
}
