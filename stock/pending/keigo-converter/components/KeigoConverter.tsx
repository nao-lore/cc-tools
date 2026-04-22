"use client";

import { useState, useCallback } from "react";
import { getSortedKeigoEntries, type KeigoEntry } from "../lib/keigo-dict";

const SAMPLE_TEXT = "明日、田中さんに会って、資料を渡す予定です。後で確認して連絡する。";

interface ConversionResult {
  original: string;
  sonkeigo: string;
  kenjogo: string;
  teineigo: string;
  highlights: { start: number; end: number; replacement: string }[];
}

function convertText(input: string, type: keyof KeigoEntry): { result: string; changed: boolean } {
  const entries = getSortedKeigoEntries();
  let result = input;
  let changed = false;

  for (const [plain, forms] of entries) {
    if (result.includes(plain)) {
      result = result.split(plain).join(forms[type]);
      changed = true;
    }
  }

  return { result, changed };
}

interface HighlightedTextProps {
  original: string;
  converted: string;
}

function HighlightedText({ original, converted }: HighlightedTextProps) {
  if (original === converted) {
    return <span className="text-gray-600 text-sm">{converted}</span>;
  }

  const entries = getSortedKeigoEntries();
  const parts: { text: string; isChanged: boolean }[] = [];
  let remaining = converted;
  let originalRemaining = original;

  // Simple approach: find changed segments by diffing
  // Build a token list from original and mark changed ones
  let pos = 0;
  const origCopy = original;
  let convCopy = converted;

  // Track which spans in converted text are replacements
  const markedConverted = convCopy;

  // Simpler: just show the whole thing highlighted if anything changed
  const hasChange = original !== converted;

  if (!hasChange) {
    return <span className="text-gray-600 text-sm">{converted}</span>;
  }

  // Find segments that differ
  const origEntries = entries.filter(([plain]) => original.includes(plain));

  if (origEntries.length === 0) {
    return <span className="text-gray-600 text-sm">{converted}</span>;
  }

  // Build highlighted output by marking converted phrases
  let workingConverted = converted;
  const segments: { text: string; isHighlight: boolean }[] = [];

  // Sort by position in converted string
  type Span = { start: number; end: number; text: string };
  const spans: Span[] = [];

  let tempConverted = converted;
  for (const [, forms] of origEntries) {
    // We need to check which type we're converting to - just mark all keigo forms
    const allForms = [forms.sonkeigo, forms.kenjogo, forms.teineigo];
    for (const form of allForms) {
      let idx = tempConverted.indexOf(form);
      while (idx !== -1) {
        spans.push({ start: idx, end: idx + form.length, text: form });
        idx = tempConverted.indexOf(form, idx + form.length);
      }
    }
  }

  // Sort spans and remove overlaps
  spans.sort((a, b) => a.start - b.start);
  const mergedSpans: Span[] = [];
  for (const span of spans) {
    if (mergedSpans.length === 0 || span.start >= mergedSpans[mergedSpans.length - 1].end) {
      mergedSpans.push(span);
    }
  }

  let cursor = 0;
  for (const span of mergedSpans) {
    if (cursor < span.start) {
      segments.push({ text: converted.slice(cursor, span.start), isHighlight: false });
    }
    segments.push({ text: span.text, isHighlight: true });
    cursor = span.end;
  }
  if (cursor < converted.length) {
    segments.push({ text: converted.slice(cursor), isHighlight: false });
  }

  if (segments.length === 0) {
    return <span className="text-gray-600 text-sm">{converted}</span>;
  }

  return (
    <>
      {segments.map((seg, i) =>
        seg.isHighlight ? (
          <mark key={i} className="bg-yellow-200 text-yellow-900 rounded px-0.5 not-italic font-medium">
            {seg.text}
          </mark>
        ) : (
          <span key={i} className="text-gray-700">{seg.text}</span>
        )
      )}
    </>
  );
}

interface PatternCardProps {
  label: string;
  description: string;
  color: string;
  bgColor: string;
  borderColor: string;
  badgeColor: string;
  original: string;
  converted: string;
  onCopy: () => void;
  copied: boolean;
}

function PatternCard({
  label,
  description,
  color,
  bgColor,
  borderColor,
  badgeColor,
  original,
  converted,
  onCopy,
  copied,
}: PatternCardProps) {
  return (
    <div className={`rounded-xl border-2 ${borderColor} ${bgColor} p-4`}>
      <div className="flex items-start justify-between mb-3">
        <div>
          <span className={`inline-block text-xs font-bold px-2 py-0.5 rounded-full ${badgeColor} mb-1`}>
            {label}
          </span>
          <p className="text-xs text-gray-500">{description}</p>
        </div>
        <button
          onClick={onCopy}
          className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors shrink-0 ${
            copied
              ? "bg-green-100 text-green-700"
              : "bg-white hover:bg-gray-50 text-gray-600 border border-gray-200"
          }`}
        >
          {copied ? (
            <>
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              コピー済み
            </>
          ) : (
            <>
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              コピー
            </>
          )}
        </button>
      </div>
      <div className="bg-white rounded-lg p-3 border border-gray-100 text-sm leading-relaxed min-h-[60px]">
        <HighlightedText original={original} converted={converted} />
      </div>
    </div>
  );
}

export default function KeigoConverter() {
  const [input, setInput] = useState("");
  const [results, setResults] = useState<{
    sonkeigo: string;
    kenjogo: string;
    teineigo: string;
  } | null>(null);
  const [copiedMap, setCopiedMap] = useState<Record<string, boolean>>({});

  const handleConvert = useCallback(() => {
    if (!input.trim()) return;

    const sonkeigo = convertText(input, "sonkeigo").result;
    const kenjogo = convertText(input, "kenjogo").result;
    const teineigo = convertText(input, "teineigo").result;

    setResults({ sonkeigo, kenjogo, teineigo });
    setCopiedMap({});
  }, [input]);

  const handleCopy = useCallback(async (key: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
    }
    setCopiedMap((prev) => ({ ...prev, [key]: true }));
    setTimeout(() => setCopiedMap((prev) => ({ ...prev, [key]: false })), 2000);
  }, []);

  const handleSample = useCallback(() => {
    setInput(SAMPLE_TEXT);
    setResults(null);
    setCopiedMap({});
  }, []);

  const handleClear = useCallback(() => {
    setInput("");
    setResults(null);
    setCopiedMap({});
  }, []);

  return (
    <div className="space-y-6">
      {/* Input */}
      <div>
        <label htmlFor="input-text" className="block text-sm font-semibold text-gray-700 mb-2">
          変換したい文章を入力
        </label>
        <textarea
          id="input-text"
          value={input}
          onChange={(e) => {
            setInput(e.target.value);
            setResults(null);
          }}
          placeholder="例: 明日、田中さんに会って資料を渡す予定です。"
          className="w-full h-36 p-4 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-colors resize-y text-base text-gray-900 placeholder-gray-400"
        />
        <div className="flex gap-3 mt-2">
          <button
            onClick={handleSample}
            className="text-sm text-indigo-600 hover:text-indigo-800 underline underline-offset-2"
          >
            サンプルを使う
          </button>
          {input && (
            <button
              onClick={handleClear}
              className="text-sm text-gray-500 hover:text-gray-700 underline underline-offset-2"
            >
              クリア
            </button>
          )}
        </div>
      </div>

      {/* Convert Button */}
      <button
        onClick={handleConvert}
        disabled={!input.trim()}
        className="w-full py-3 px-6 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 active:bg-indigo-800 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors text-lg shadow-md hover:shadow-lg"
      >
        3パターンに変換する
      </button>

      {/* Results */}
      {results && (
        <div className="space-y-4">
          <p className="text-xs text-gray-500 text-center">
            <mark className="bg-yellow-200 text-yellow-900 rounded px-1 not-italic">黄色ハイライト</mark>
            {" "}が変換された部分です
          </p>

          <PatternCard
            label="尊敬語"
            description="相手の動作を高めて表現（お客様・上司への敬意）"
            color="blue"
            bgColor="bg-blue-50"
            borderColor="border-blue-200"
            badgeColor="bg-blue-100 text-blue-700"
            original={input}
            converted={results.sonkeigo}
            onCopy={() => handleCopy("sonkeigo", results.sonkeigo)}
            copied={!!copiedMap["sonkeigo"]}
          />

          <PatternCard
            label="謙譲語"
            description="自分の動作をへりくだって表現（自分側の行動に使う）"
            color="green"
            bgColor="bg-green-50"
            borderColor="border-green-200"
            badgeColor="bg-green-100 text-green-700"
            original={input}
            converted={results.kenjogo}
            onCopy={() => handleCopy("kenjogo", results.kenjogo)}
            copied={!!copiedMap["kenjogo"]}
          />

          <PatternCard
            label="丁寧語"
            description="ます・です調で丁寧に表現（汎用的な敬語）"
            color="purple"
            bgColor="bg-purple-50"
            borderColor="border-purple-200"
            badgeColor="bg-purple-100 text-purple-700"
            original={input}
            converted={results.teineigo}
            onCopy={() => handleCopy("teineigo", results.teineigo)}
            copied={!!copiedMap["teineigo"]}
          />

          <p className="text-xs text-gray-400 text-center">
            ※ 内蔵辞書による変換です。文脈によっては適切な敬語が異なる場合があります。
          </p>
        </div>
      )}
    </div>
  );
}
