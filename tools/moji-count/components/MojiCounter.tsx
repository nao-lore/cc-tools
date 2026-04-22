"use client";

import { useState, useCallback } from "react";

function countBytes(str: string, encoding: "utf8" | "shiftjis"): number {
  if (encoding === "utf8") {
    return new TextEncoder().encode(str).length;
  }
  // Shift_JIS approximation: ASCII = 1 byte, fullwidth/kanji/kana = 2 bytes
  let bytes = 0;
  for (const char of str) {
    const code = char.codePointAt(0) ?? 0;
    if (code < 0x80) {
      bytes += 1;
    } else {
      bytes += 2;
    }
  }
  return bytes;
}

interface Stats {
  charsWithSpaces: number;
  charsWithoutSpaces: number;
  words: number;
  lines: number;
  paragraphs: number;
  bytesUtf8: number;
  bytesShiftJis: number;
  fullwidth: number;
  halfwidth: number;
  hiragana: number;
  katakana: number;
  kanji: number;
  alphanumeric: number;
}

function computeStats(text: string): Stats {
  const charsWithSpaces = [...text].length;
  const charsWithoutSpaces = [...text].filter((c) => !/\s/.test(c)).length;

  const trimmed = text.trim();
  const words = trimmed === "" ? 0 : trimmed.split(/\s+/).length;
  const lines = text === "" ? 0 : text.split("\n").length;

  let paragraphs = 0;
  if (trimmed !== "") {
    paragraphs = trimmed.split(/\n\s*\n+/).filter((p) => p.trim() !== "").length;
  }

  const bytesUtf8 = countBytes(text, "utf8");
  const bytesShiftJis = countBytes(text, "shiftjis");

  let fullwidth = 0;
  let halfwidth = 0;
  let hiragana = 0;
  let katakana = 0;
  let kanji = 0;
  let alphanumeric = 0;

  for (const char of text) {
    const code = char.codePointAt(0) ?? 0;

    if (/[\u3041-\u3096]/.test(char)) {
      hiragana++;
      fullwidth++;
    } else if (/[\u30A1-\u30FA]/.test(char)) {
      katakana++;
      fullwidth++;
    } else if (/[\uFF66-\uFF9F]/.test(char)) {
      // halfwidth katakana
      katakana++;
      halfwidth++;
    } else if (
      /[\u4E00-\u9FFF\u3400-\u4DBF\uF900-\uFAFF]/.test(char)
    ) {
      kanji++;
      fullwidth++;
    } else if (/[A-Za-z0-9]/.test(char)) {
      alphanumeric++;
      halfwidth++;
    } else if (/[\uFF01-\uFF5E]/.test(char)) {
      // fullwidth ASCII variants
      fullwidth++;
    } else if (code >= 0x20 && code < 0x7F) {
      halfwidth++;
    } else if (code > 0x7F) {
      fullwidth++;
    }
  }

  return {
    charsWithSpaces,
    charsWithoutSpaces,
    words,
    lines,
    paragraphs,
    bytesUtf8,
    bytesShiftJis,
    fullwidth,
    halfwidth,
    hiragana,
    katakana,
    kanji,
    alphanumeric,
  };
}

interface StatCardProps {
  label: string;
  value: number;
  highlight?: boolean;
}

function StatCard({ label, value, highlight }: StatCardProps) {
  return (
    <div
      className={`rounded-lg p-4 flex flex-col items-center justify-center gap-1 ${
        highlight
          ? "bg-[var(--color-primary)] text-white"
          : "bg-gray-50 border border-gray-200"
      }`}
    >
      <span
        className={`text-2xl font-bold tabular-nums ${
          highlight ? "text-white" : "text-gray-800"
        }`}
      >
        {value.toLocaleString()}
      </span>
      <span
        className={`text-xs text-center leading-tight ${
          highlight ? "text-white/80" : "text-gray-500"
        }`}
      >
        {label}
      </span>
    </div>
  );
}

export function MojiCounter() {
  const [text, setText] = useState("");

  const stats = computeStats(text);

  const handleClear = useCallback(() => {
    setText("");
  }, []);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(text).catch(() => {});
  }, [text]);

  return (
    <div className="space-y-6">
      {/* Textarea */}
      <div className="relative">
        <textarea
          className="w-full h-48 p-4 border border-gray-300 rounded-lg text-sm leading-relaxed resize-y focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent font-sans"
          placeholder="ここにテキストを入力してください..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          spellCheck={false}
        />
        <div className="flex justify-end gap-2 mt-2">
          <button
            onClick={handleCopy}
            disabled={text === ""}
            className="text-xs px-3 py-1.5 rounded border border-gray-300 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            コピー
          </button>
          <button
            onClick={handleClear}
            disabled={text === ""}
            className="text-xs px-3 py-1.5 rounded border border-red-200 text-red-500 hover:bg-red-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            クリア
          </button>
        </div>
      </div>

      {/* Primary stats */}
      <div>
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
          基本カウント
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          <StatCard label="文字数（スペースあり）" value={stats.charsWithSpaces} highlight />
          <StatCard label="文字数（スペースなし）" value={stats.charsWithoutSpaces} />
          <StatCard label="単語数" value={stats.words} />
          <StatCard label="行数" value={stats.lines} />
          <StatCard label="段落数" value={stats.paragraphs} />
          <StatCard label="バイト数（UTF-8）" value={stats.bytesUtf8} />
          <StatCard label="バイト数（Shift_JIS）" value={stats.bytesShiftJis} />
        </div>
      </div>

      {/* Character type breakdown */}
      <div>
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
          文字種別
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          <StatCard label="全角文字数" value={stats.fullwidth} />
          <StatCard label="半角文字数" value={stats.halfwidth} />
          <StatCard label="ひらがな数" value={stats.hiragana} />
          <StatCard label="カタカナ数" value={stats.katakana} />
          <StatCard label="漢字数" value={stats.kanji} />
          <StatCard label="英数字数" value={stats.alphanumeric} />
        </div>
      </div>
    </div>
  );
}
