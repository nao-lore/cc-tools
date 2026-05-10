"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

type Stats = {
  charsWithSpaces: number;
  charsWithoutSpaces: number;
  words: number;
  lines: number;
  paragraphs: number;
  bytesUtf8: number;
  bytesShiftJisApprox: number;
  fullwidth: number;
  halfwidth: number;
  hiragana: number;
  katakana: number;
  kanji: number;
  alphanumeric: number;
  punctuation: number;
};

const SAMPLES = [
  {
    label: "SNS投稿",
    text: "新しい文字数カウントツールを公開しました。スペースあり・なし、UTF-8バイト数、文字種別までブラウザ内で確認できます。",
  },
  {
    label: "メタ説明",
    text: "日本語テキストの文字数、行数、段落数、UTF-8バイト数、ひらがな・カタカナ・漢字の内訳を無料でカウントできます。",
  },
  {
    label: "混在テキスト",
    text: "AI tools 2026: 価格・文字数・CSV出力をまとめて確認。全角ＡＢＣと半角ABC、カタカナとｶﾀｶﾅも判定します。",
  },
];

function countBytes(text: string, encoding: "utf8" | "shiftjis") {
  if (encoding === "utf8") return new TextEncoder().encode(text).length;

  let bytes = 0;
  for (const char of text) {
    const code = char.codePointAt(0) ?? 0;
    bytes += code < 0x80 ? 1 : 2;
  }
  return bytes;
}

function computeStats(text: string): Stats {
  const chars = [...text];
  const trimmed = text.trim();
  const lines = text === "" ? 0 : text.split("\n").length;
  const paragraphs = trimmed === "" ? 0 : trimmed.split(/\n\s*\n+/).filter((line) => line.trim() !== "").length;

  let fullwidth = 0;
  let halfwidth = 0;
  let hiragana = 0;
  let katakana = 0;
  let kanji = 0;
  let alphanumeric = 0;
  let punctuation = 0;

  for (const char of chars) {
    const code = char.codePointAt(0) ?? 0;

    if (/[\u3041-\u3096]/.test(char)) {
      hiragana++;
      fullwidth++;
    } else if (/[\u30A1-\u30FA]/.test(char)) {
      katakana++;
      fullwidth++;
    } else if (/[\uFF66-\uFF9F]/.test(char)) {
      katakana++;
      halfwidth++;
    } else if (/[\u4E00-\u9FFF\u3400-\u4DBF\uF900-\uFAFF]/.test(char)) {
      kanji++;
      fullwidth++;
    } else if (/[A-Za-z0-9]/.test(char)) {
      alphanumeric++;
      halfwidth++;
    } else if (/[\uFF01-\uFF5E]/.test(char)) {
      fullwidth++;
      punctuation++;
    } else if (/[、。！？,.!?;:()[\]{}"'「」『』・]/.test(char)) {
      punctuation++;
      if (code < 0x80) halfwidth++;
      else fullwidth++;
    } else if (code >= 0x20 && code < 0x7f) {
      halfwidth++;
    } else if (code > 0x7f) {
      fullwidth++;
    }
  }

  return {
    charsWithSpaces: chars.length,
    charsWithoutSpaces: chars.filter((char) => !/\s/.test(char)).length,
    words: trimmed === "" ? 0 : trimmed.split(/\s+/).length,
    lines,
    paragraphs,
    bytesUtf8: countBytes(text, "utf8"),
    bytesShiftJisApprox: countBytes(text, "shiftjis"),
    fullwidth,
    halfwidth,
    hiragana,
    katakana,
    kanji,
    alphanumeric,
    punctuation,
  };
}

function format(value: number) {
  return value.toLocaleString("ja-JP");
}

function buildStatsText(stats: Stats) {
  return [
    `文字数（スペースあり）: ${format(stats.charsWithSpaces)}`,
    `文字数（スペースなし）: ${format(stats.charsWithoutSpaces)}`,
    `空白区切り語数: ${format(stats.words)}`,
    `行数: ${format(stats.lines)}`,
    `段落数: ${format(stats.paragraphs)}`,
    `UTF-8バイト数: ${format(stats.bytesUtf8)}`,
    `Shift_JIS概算バイト数: ${format(stats.bytesShiftJisApprox)}`,
    `ひらがな: ${format(stats.hiragana)}`,
    `カタカナ: ${format(stats.katakana)}`,
    `漢字: ${format(stats.kanji)}`,
  ].join("\n");
}

function buildCsv(stats: Stats) {
  const rows = [
    ["metric", "value"],
    ["chars_with_spaces", String(stats.charsWithSpaces)],
    ["chars_without_spaces", String(stats.charsWithoutSpaces)],
    ["whitespace_words", String(stats.words)],
    ["lines", String(stats.lines)],
    ["paragraphs", String(stats.paragraphs)],
    ["utf8_bytes", String(stats.bytesUtf8)],
    ["shiftjis_bytes_approx", String(stats.bytesShiftJisApprox)],
    ["fullwidth", String(stats.fullwidth)],
    ["halfwidth", String(stats.halfwidth)],
    ["hiragana", String(stats.hiragana)],
    ["katakana", String(stats.katakana)],
    ["kanji", String(stats.kanji)],
    ["alphanumeric", String(stats.alphanumeric)],
    ["punctuation", String(stats.punctuation)],
  ];
  return rows.map((row) => row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(",")).join("\n");
}

function downloadCsv(text: string) {
  const blob = new Blob([text], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = "moji-count.csv";
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}

export function MojiCounter() {
  const [text, setText] = useState(SAMPLES[0].text);
  const [copied, setCopied] = useState<"text" | "stats" | "">("");

  const stats = useMemo(() => computeStats(text), [text]);
  const validationError = text.length > 100_000 ? "入力エラー: 10万文字を超えています。ブラウザが重くなる場合は分割してください。" : "";

  async function copyText() {
    if (!text) return;
    await navigator.clipboard.writeText(text);
    setCopied("text");
    window.setTimeout(() => setCopied(""), 1600);
  }

  async function copyStats() {
    await navigator.clipboard.writeText(buildStatsText(stats));
    setCopied("stats");
    window.setTimeout(() => setCopied(""), 1600);
  }

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="grid gap-0 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="border-b border-slate-200 p-5 sm:p-6 lg:border-b-0 lg:border-r">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h2 className="text-base font-semibold text-slate-950">テキスト入力</h2>
              <p className="mt-1 text-sm leading-6 text-slate-500">入力値はブラウザ内で処理され、外部に送信されません。</p>
            </div>
            <button
              type="button"
              onClick={() => {
                setText("");
                setCopied("");
              }}
              className="w-fit rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              クリア
            </button>
          </div>

          <label className="mt-5 grid gap-2 text-sm font-medium text-slate-700" htmlFor="moji-count-input">
            カウントする文章
            <textarea
              id="moji-count-input"
              value={text}
              onChange={(event) => {
                setText(event.target.value);
                setCopied("");
              }}
              spellCheck={false}
              rows={14}
              className="w-full resize-y rounded-2xl border border-slate-300 bg-white p-4 text-sm leading-7 text-slate-950 outline-none focus:border-slate-900"
              placeholder="ここにテキストを入力してください"
            />
          </label>

          <p className={`mt-3 min-h-5 text-sm ${validationError ? "text-red-600" : "text-slate-500"}`}>
            {validationError || "スペースあり・なし、文字種別、UTF-8バイト数、Shift_JIS概算バイト数を同時に確認できます。"}
          </p>

          <div className="mt-5 flex flex-wrap gap-2">
            <button type="button" onClick={copyText} disabled={!text} className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:text-slate-300">
              {copied === "text" ? "本文コピー済み" : "本文をコピー"}
            </button>
            <button type="button" onClick={copyStats} className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">
              {copied === "stats" ? "結果コピー済み" : "結果をコピー"}
            </button>
            <button type="button" onClick={() => downloadCsv(buildCsv(stats))} className="rounded-lg bg-slate-950 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800">
              CSVダウンロード
            </button>
          </div>

          <div className="mt-5">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">サンプル</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {SAMPLES.map((sample) => (
                <button
                  key={sample.label}
                  type="button"
                  onClick={() => {
                    setText(sample.text);
                    setCopied("");
                  }}
                  className="rounded-full border border-slate-300 px-3 py-1.5 text-sm text-slate-700 hover:border-slate-900 hover:bg-slate-50"
                >
                  {sample.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="min-w-0 bg-slate-50 p-5 sm:p-6">
          <h2 className="text-base font-semibold text-slate-950">カウント結果</h2>
          <div className="mt-4 grid gap-3">
            <StatCard label="文字数（スペースあり）" value={stats.charsWithSpaces} strong />
            <StatCard label="文字数（スペースなし）" value={stats.charsWithoutSpaces} />
            <StatCard label="空白区切り語数" value={stats.words} />
            <StatCard label="行数" value={stats.lines} />
            <StatCard label="段落数" value={stats.paragraphs} />
            <StatCard label="UTF-8バイト数" value={stats.bytesUtf8} />
            <StatCard label="Shift_JIS概算バイト数" value={stats.bytesShiftJisApprox} />
          </div>

          <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-4">
            <h2 className="text-sm font-semibold text-slate-950">文字種別</h2>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <MiniStat label="全角" value={stats.fullwidth} />
              <MiniStat label="半角" value={stats.halfwidth} />
              <MiniStat label="ひらがな" value={stats.hiragana} />
              <MiniStat label="カタカナ" value={stats.katakana} />
              <MiniStat label="漢字" value={stats.kanji} />
              <MiniStat label="英数字" value={stats.alphanumeric} />
              <MiniStat label="記号" value={stats.punctuation} />
            </div>
          </div>

          <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-900">
            <p className="font-semibold">日本語の単語数について</p>
            <p className="mt-1">
              日本語は英語のようにスペースで単語が分かれないため、このツールの単語数は空白区切りの目安です。厳密な形態素解析ではありません。
            </p>
          </div>
        </div>
      </div>

      <div className="border-t border-slate-200 p-5 sm:p-6">
        <h2 className="text-base font-semibold text-slate-950">関連ツール</h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Related href="/zenkaku-hankaku" title="全角・半角変換" body="文字幅を一括変換" />
          <Related href="/furigana" title="ふりがな変換" body="漢字にふりがなを付ける" />
          <Related href="/markdown-preview" title="Markdownプレビュー" body="文章を見ながら整える" />
          <Related href="/text-diff" title="テキスト差分" body="変更前後の違いを比較" />
        </div>
      </div>
    </section>
  );
}

function StatCard({ label, value, strong = false }: { label: string; value: number; strong?: boolean }) {
  return (
    <div className={`rounded-xl border p-4 ${strong ? "border-slate-950 bg-slate-950 text-white" : "border-slate-200 bg-white text-slate-950"}`}>
      <p className={`text-xs font-medium uppercase tracking-wide ${strong ? "text-white/70" : "text-slate-500"}`}>{label}</p>
      <p className="mt-1 font-mono text-2xl font-bold">{format(value)}</p>
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl bg-slate-50 p-3">
      <p className="text-xs text-slate-500">{label}</p>
      <p className="mt-1 font-mono text-lg font-bold text-slate-950">{format(value)}</p>
    </div>
  );
}

function Related({ href, title, body }: { href: string; title: string; body: string }) {
  return (
    <Link href={href} className="rounded-xl border border-slate-200 p-4 hover:border-slate-400 hover:bg-slate-50">
      <div className="text-sm font-semibold text-slate-950">{title}</div>
      <div className="mt-1 text-xs leading-5 text-slate-500">{body}</div>
    </Link>
  );
}
