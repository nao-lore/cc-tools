"use client";

import { useState, useMemo } from "react";

interface CharCounts {
  total: number;
  fullwidth: number;
  halfwidth: number;
  hiragana: number;
  katakana: number;
  kanji: number;
  alpha: number;
  digit: number;
  space: number;
  newline: number;
  other: number;
}

const SNS_LIMITS = [
  { name: "Twitter (日本語)", limit: 140, color: "bg-sky-400" },
  { name: "Twitter (英語)", limit: 280, color: "bg-sky-400" },
  { name: "LINE", limit: 500, color: "bg-green-400" },
  { name: "Instagram", limit: 2200, color: "bg-pink-400" },
];

function countChars(text: string): CharCounts {
  let fullwidth = 0;
  let halfwidth = 0;
  let hiragana = 0;
  let katakana = 0;
  let kanji = 0;
  let alpha = 0;
  let digit = 0;
  let space = 0;
  let newline = 0;
  let other = 0;

  for (const ch of text) {
    const cp = ch.codePointAt(0) ?? 0;

    if (ch === "\n") {
      newline++;
      halfwidth++;
      continue;
    }
    if (ch === " " || ch === "\t") {
      space++;
      halfwidth++;
      continue;
    }
    if (ch === "\u3000") {
      // 全角スペース
      space++;
      fullwidth++;
      continue;
    }

    const isHiragana = cp >= 0x3040 && cp <= 0x309f;
    const isKatakana = cp >= 0x30a0 && cp <= 0x30ff;
    const isKanji = cp >= 0x4e00 && cp <= 0x9fff;
    const isAlpha = (cp >= 0x41 && cp <= 0x5a) || (cp >= 0x61 && cp <= 0x7a);
    const isDigit = cp >= 0x30 && cp <= 0x39;
    const isHalfKana = cp >= 0xff65 && cp <= 0xff9f;
    const isFullAlpha =
      (cp >= 0xff21 && cp <= 0xff3a) || (cp >= 0xff41 && cp <= 0xff5a);
    const isFullDigit = cp >= 0xff10 && cp <= 0xff19;

    if (isHiragana) {
      hiragana++;
      fullwidth++;
    } else if (isKatakana) {
      katakana++;
      fullwidth++;
    } else if (isKanji) {
      kanji++;
      fullwidth++;
    } else if (isFullAlpha) {
      alpha++;
      fullwidth++;
    } else if (isFullDigit) {
      digit++;
      fullwidth++;
    } else if (isAlpha) {
      alpha++;
      halfwidth++;
    } else if (isDigit) {
      digit++;
      halfwidth++;
    } else if (isHalfKana) {
      katakana++;
      halfwidth++;
    } else if (cp > 0x7f) {
      // その他全角（記号・絵文字等）
      other++;
      fullwidth++;
    } else {
      // その他半角
      other++;
      halfwidth++;
    }
  }

  return {
    total: [...text].length,
    fullwidth,
    halfwidth,
    hiragana,
    katakana,
    kanji,
    alpha,
    digit,
    space,
    newline,
    other,
  };
}

interface BarSegmentProps {
  label: string;
  count: number;
  total: number;
  color: string;
}

function BarSegment({ label, count, total, color }: BarSegmentProps) {
  const pct = total > 0 ? (count / total) * 100 : 0;
  if (count === 0) return null;
  return (
    <div
      className={`${color} h-full`}
      style={{ width: `${pct}%` }}
      title={`${label}: ${count}文字 (${pct.toFixed(1)}%)`}
    />
  );
}

interface CountRowProps {
  label: string;
  count: number;
  total: number;
  color: string;
  dot?: boolean;
}

function CountRow({ label, count, total, color, dot }: CountRowProps) {
  const pct = total > 0 ? ((count / total) * 100).toFixed(1) : "0.0";
  return (
    <div className="flex items-center justify-between py-1.5 border-b border-border last:border-0">
      <div className="flex items-center gap-2">
        {dot && <span className={`inline-block w-2.5 h-2.5 rounded-sm ${color}`} />}
        <span className="text-sm text-gray-700">{label}</span>
      </div>
      <div className="flex items-center gap-3">
        <span className="text-xs text-muted w-12 text-right">{pct}%</span>
        <span className="text-sm font-semibold text-gray-900 w-10 text-right tabular-nums">
          {count.toLocaleString()}
        </span>
      </div>
    </div>
  );
}

const BREAKDOWN_ITEMS = [
  { key: "hiragana" as const, label: "ひらがな", color: "bg-violet-400" },
  { key: "katakana" as const, label: "カタカナ", color: "bg-blue-400" },
  { key: "kanji" as const, label: "漢字", color: "bg-orange-400" },
  { key: "alpha" as const, label: "英字", color: "bg-green-400" },
  { key: "digit" as const, label: "数字", color: "bg-yellow-400" },
  { key: "space" as const, label: "スペース", color: "bg-gray-300" },
  { key: "newline" as const, label: "改行", color: "bg-gray-400" },
  { key: "other" as const, label: "その他", color: "bg-pink-300" },
];

export default function CharacterCounterJp() {
  const [text, setText] = useState("");

  const counts = useMemo(() => countChars(text), [text]);

  const totalNonNewline = counts.total - counts.newline;

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-surface rounded-2xl border border-border p-4">
        <h1 className="text-lg font-bold text-gray-900 mb-1">
          文字種別 文字数カウンター
        </h1>
        <p className="text-muted text-sm">
          テキストを入力すると全角・半角・ひらがな・カタカナ・漢字・英数字などを分類してリアルタイムにカウントします。
        </p>
      </div>

      {/* Textarea */}
      <div className="bg-surface rounded-2xl border border-border p-4">
        <div className="flex items-center justify-between mb-2">
          <label className="text-muted text-xs">テキストを入力</label>
          {text.length > 0 && (
            <button
              onClick={() => setText("")}
              className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
            >
              クリア
            </button>
          )}
        </div>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={8}
          placeholder="ここにテキストを貼り付けてください…"
          className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y font-sans"
        />
      </div>

      {/* Total counts */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "総文字数", value: counts.total, sub: "改行含む" },
          { label: "全角文字数", value: counts.fullwidth, sub: "漢字・かな等" },
          { label: "半角文字数", value: counts.halfwidth, sub: "英数・記号等" },
          {
            label: "文字数（改行除く）",
            value: totalNonNewline,
            sub: "本文のみ",
          },
        ].map(({ label, value, sub }) => (
          <div
            key={label}
            className="bg-surface rounded-2xl border border-border p-4 text-center"
          >
            <p className="text-muted text-xs mb-1">{label}</p>
            <p className="text-3xl font-bold text-gray-900 tabular-nums">
              {value.toLocaleString()}
            </p>
            <p className="text-muted text-xs mt-1">{sub}</p>
          </div>
        ))}
      </div>

      {/* Bar chart breakdown */}
      <div className="bg-surface rounded-2xl border border-border p-4">
        <h2 className="font-semibold text-gray-900 text-sm mb-3">
          文字種別の内訳
        </h2>

        {counts.total > 0 ? (
          <>
            {/* Stacked bar */}
            <div className="flex h-5 w-full rounded-full overflow-hidden mb-4 bg-gray-100">
              {BREAKDOWN_ITEMS.map((item) => (
                <BarSegment
                  key={item.key}
                  label={item.label}
                  count={counts[item.key]}
                  total={counts.total}
                  color={item.color}
                />
              ))}
            </div>

            {/* Legend + counts */}
            <div className="divide-y divide-border">
              {BREAKDOWN_ITEMS.map((item) => (
                <CountRow
                  key={item.key}
                  label={item.label}
                  count={counts[item.key]}
                  total={counts.total}
                  color={item.color}
                  dot
                />
              ))}
            </div>
          </>
        ) : (
          <p className="text-muted text-sm text-center py-6">
            テキストを入力すると内訳が表示されます
          </p>
        )}
      </div>

      {/* SNS limits reference */}
      <div className="bg-surface rounded-2xl border border-border p-4">
        <h2 className="font-semibold text-gray-900 text-sm mb-3">
          SNS文字数制限の参考
        </h2>
        <div className="space-y-3">
          {SNS_LIMITS.map(({ name, limit, color }) => {
            const used = Math.min(counts.total, limit);
            const pct = (used / limit) * 100;
            const over = counts.total > limit;
            return (
              <div key={name}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-gray-700">{name}</span>
                  <span
                    className={`text-xs font-semibold tabular-nums ${over ? "text-red-500" : "text-muted"}`}
                  >
                    {counts.total.toLocaleString()} / {limit.toLocaleString()}
                    {over && "　超過"}
                  </span>
                </div>
                <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${over ? "bg-red-400" : color}`}
                    style={{ width: `${Math.min(pct, 100)}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Ad placeholder */}
      <div className="w-full h-20 bg-gray-50 border border-dashed border-gray-300 rounded-lg flex items-center justify-center text-gray-400 text-sm">
        広告スペース
      </div>
    </div>
  );
}
