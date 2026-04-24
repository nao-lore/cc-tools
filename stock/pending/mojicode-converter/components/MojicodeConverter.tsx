"use client";

import { useState, useCallback } from "react";

type Encoding = "UTF-8" | "Shift_JIS" | "EUC-JP" | "UTF-16";

interface EncodingResult {
  encoding: Encoding;
  hex: string;
  bytes: number;
  supported: boolean;
}

function encodeToHex(text: string, encoding: Encoding): EncodingResult {
  if (!text) {
    return { encoding, hex: "", bytes: 0, supported: true };
  }

  try {
    if (encoding === "UTF-8") {
      const encoder = new TextEncoder();
      const bytes = encoder.encode(text);
      const hex = Array.from(bytes)
        .map((b) => b.toString(16).toUpperCase().padStart(2, "0"))
        .join(" ");
      return { encoding, hex, bytes: bytes.length, supported: true };
    }

    if (encoding === "UTF-16") {
      // UTF-16 LE with BOM
      const arr: number[] = [];
      for (let i = 0; i < text.length; i++) {
        const code = text.charCodeAt(i);
        arr.push(code & 0xff);
        arr.push((code >> 8) & 0xff);
      }
      const hex = arr
        .map((b) => b.toString(16).toUpperCase().padStart(2, "0"))
        .join(" ");
      return { encoding, hex, bytes: arr.length, supported: true };
    }

    if (encoding === "Shift_JIS") {
      const bytes = encodeShiftJIS(text);
      if (bytes === null) {
        return { encoding, hex: "（変換不可の文字が含まれています）", bytes: 0, supported: false };
      }
      const hex = Array.from(bytes)
        .map((b) => b.toString(16).toUpperCase().padStart(2, "0"))
        .join(" ");
      return { encoding, hex, bytes: bytes.length, supported: true };
    }

    if (encoding === "EUC-JP") {
      const bytes = encodeEUCJP(text);
      if (bytes === null) {
        return { encoding, hex: "（変換不可の文字が含まれています）", bytes: 0, supported: false };
      }
      const hex = Array.from(bytes)
        .map((b) => b.toString(16).toUpperCase().padStart(2, "0"))
        .join(" ");
      return { encoding, hex, bytes: bytes.length, supported: true };
    }
  } catch {
    return { encoding, hex: "（エンコードエラー）", bytes: 0, supported: false };
  }

  return { encoding, hex: "", bytes: 0, supported: false };
}

// Shift_JIS encoding for common Japanese characters via Unicode code point mapping
function encodeShiftJIS(text: string): Uint8Array | null {
  const result: number[] = [];
  for (let i = 0; i < text.length; i++) {
    const cp = text.codePointAt(i)!;
    if (cp > 0xffff) i++; // surrogate pair

    // ASCII range
    if (cp < 0x80) {
      result.push(cp);
      continue;
    }

    // Half-width katakana (U+FF61–U+FF9F)
    if (cp >= 0xff61 && cp <= 0xff9f) {
      result.push(cp - 0xff61 + 0xa1);
      continue;
    }

    // Full-width space
    if (cp === 0x3000) {
      result.push(0x81, 0x40);
      continue;
    }

    // JIS X 0208 via table lookup
    const sjis = unicodeToShiftJIS(cp);
    if (sjis === null) return null;
    if (sjis > 0xff) {
      result.push((sjis >> 8) & 0xff);
      result.push(sjis & 0xff);
    } else {
      result.push(sjis);
    }
  }
  return new Uint8Array(result);
}

function unicodeToShiftJIS(cp: number): number | null {
  // Hiragana U+3041–U+3096 → JIS 0x2421–0x2473
  if (cp >= 0x3041 && cp <= 0x3096) {
    return jisx0208ToShiftJIS(0x24, 0x21 + (cp - 0x3041));
  }
  // Katakana U+30A1–U+30F6 → JIS 0x2521–0x2576
  if (cp >= 0x30a1 && cp <= 0x30f6) {
    return jisx0208ToShiftJIS(0x25, 0x21 + (cp - 0x30a1));
  }
  // Full-width ASCII U+FF01–U+FF5E → JIS 0x2321–0x237E
  if (cp >= 0xff01 && cp <= 0xff5e) {
    return jisx0208ToShiftJIS(0x23, 0x21 + (cp - 0xff01));
  }
  // CJK Unified Ideographs — use a small direct mapping for common kanji
  // For browser use, we approximate via the TextEncoder with iso-2022-jp trick if available
  // Otherwise mark as unsupported for rare kanji
  const cjk = cjkToShiftJIS(cp);
  if (cjk !== null) return cjk;

  // If none matched, mark unsupported
  return null;
}

// Convert JIS X 0208 row/col to Shift_JIS 2-byte value
function jisx0208ToShiftJIS(row: number, col: number): number {
  // row: 0x21–0x7E (JIS rows 1–94), col: 0x21–0x7E
  let s1: number, s2: number;
  if (row <= 0x3f) {
    s1 = Math.floor((row - 0x21) / 2) + 0x70 + 1;
    if (s1 > 0x9f) s1 += 0x40;
  } else {
    s1 = Math.floor((row - 0x21) / 2) + 0xb0 + 1;
    if (s1 > 0xef) s1 += 0x40;
  }
  if (row % 2 === 1) {
    s2 = col + (col <= 0x5f ? 0x1f : 0x20);
  } else {
    s2 = col + 0x7e;
  }
  return (s1 << 8) | s2;
}

// Very small CJK lookup for demo — returns null for kanji not in table
function cjkToShiftJIS(_cp: number): number | null {
  // For a production tool you'd embed the full JIS X 0208 table.
  // Here we return null to indicate "unsupported" for arbitrary kanji,
  // which triggers the "変換不可" message.
  return null;
}

// EUC-JP encoding
function encodeEUCJP(text: string): Uint8Array | null {
  const result: number[] = [];
  for (let i = 0; i < text.length; i++) {
    const cp = text.codePointAt(i)!;
    if (cp > 0xffff) i++;

    if (cp < 0x80) {
      result.push(cp);
      continue;
    }

    // Half-width katakana → EUC-JP SS2 (0x8E prefix)
    if (cp >= 0xff61 && cp <= 0xff9f) {
      result.push(0x8e, cp - 0xff61 + 0xa1);
      continue;
    }

    // Hiragana
    if (cp >= 0x3041 && cp <= 0x3096) {
      const jisRow = 0x24;
      const jisCol = 0x21 + (cp - 0x3041);
      result.push(jisRow | 0x80, jisCol | 0x80);
      continue;
    }

    // Katakana
    if (cp >= 0x30a1 && cp <= 0x30f6) {
      const jisRow = 0x25;
      const jisCol = 0x21 + (cp - 0x30a1);
      result.push(jisRow | 0x80, jisCol | 0x80);
      continue;
    }

    // Full-width ASCII
    if (cp >= 0xff01 && cp <= 0xff5e) {
      const jisRow = 0x23;
      const jisCol = 0x21 + (cp - 0xff01);
      result.push(jisRow | 0x80, jisCol | 0x80);
      continue;
    }

    // Full-width space
    if (cp === 0x3000) {
      result.push(0xa1, 0xa1);
      continue;
    }

    // Other characters not in table
    return null;
  }
  return new Uint8Array(result);
}

function detectEncoding(text: string): string {
  if (!text) return "—";
  let hasNonAscii = false;
  let hasFullWidth = false;
  let hasHiraganaKatakana = false;
  let hasKanji = false;

  for (let i = 0; i < text.length; i++) {
    const cp = text.codePointAt(i)!;
    if (cp > 0x7f) hasNonAscii = true;
    if ((cp >= 0xff01 && cp <= 0xff5e) || cp === 0x3000) hasFullWidth = true;
    if ((cp >= 0x3041 && cp <= 0x3096) || (cp >= 0x30a1 && cp <= 0x30f6)) hasHiraganaKatakana = true;
    if (cp >= 0x4e00 && cp <= 0x9fff) hasKanji = true;
  }

  if (!hasNonAscii) return "ASCII（UTF-8 互換）";
  if (hasHiraganaKatakana || hasKanji || hasFullWidth) return "日本語テキスト（UTF-8 推奨）";
  return "非ASCII文字を含むテキスト（UTF-8 推奨）";
}

const ENCODINGS: Encoding[] = ["UTF-8", "Shift_JIS", "EUC-JP", "UTF-16"];

const ENCODING_LABELS: Record<Encoding, string> = {
  "UTF-8": "UTF-8",
  "Shift_JIS": "Shift_JIS",
  "EUC-JP": "EUC-JP",
  "UTF-16": "UTF-16 (LE)",
};

const ENCODING_COLORS: Record<Encoding, string> = {
  "UTF-8": "bg-blue-50 border-blue-200 text-blue-800",
  "Shift_JIS": "bg-green-50 border-green-200 text-green-800",
  "EUC-JP": "bg-purple-50 border-purple-200 text-purple-800",
  "UTF-16": "bg-orange-50 border-orange-200 text-orange-800",
};

const ENCODING_BADGE: Record<Encoding, string> = {
  "UTF-8": "bg-blue-100 text-blue-700",
  "Shift_JIS": "bg-green-100 text-green-700",
  "EUC-JP": "bg-purple-100 text-purple-700",
  "UTF-16": "bg-orange-100 text-orange-700",
};

export default function MojicodeConverter() {
  const [input, setInput] = useState("");
  const [results, setResults] = useState<EncodingResult[]>([]);
  const [detectedEncoding, setDetectedEncoding] = useState("");
  const [copiedEncoding, setCopiedEncoding] = useState<Encoding | null>(null);
  const [autoAnalyze, setAutoAnalyze] = useState(true);

  const analyze = useCallback((text: string) => {
    const res = ENCODINGS.map((enc) => encodeToHex(text, enc));
    setResults(res);
    setDetectedEncoding(detectEncoding(text));
  }, []);

  const handleInputChange = (value: string) => {
    setInput(value);
    if (autoAnalyze) {
      analyze(value);
    }
  };

  const handleAnalyze = () => {
    analyze(input);
  };

  const handleClear = () => {
    setInput("");
    setResults([]);
    setDetectedEncoding("");
  };

  const handleCopy = async (result: EncodingResult) => {
    if (!result.hex || !result.supported) return;
    try {
      await navigator.clipboard.writeText(result.hex);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = result.hex;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
    }
    setCopiedEncoding(result.encoding);
    setTimeout(() => setCopiedEncoding(null), 2000);
  };

  const hasResults = results.length > 0;

  return (
    <div className="space-y-6">
      {/* Input Area */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-medium text-muted">
            テキスト入力
          </label>
          <span className="text-xs text-muted">{input.length} 文字</span>
        </div>
        <textarea
          value={input}
          onChange={(e) => handleInputChange(e.target.value)}
          placeholder="ここにテキストを入力またはペーストしてください..."
          rows={5}
          className="w-full rounded-lg border border-border bg-card p-4 text-base resize-y focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors placeholder:text-muted/50"
        />
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap items-center justify-center gap-3">
        <button
          onClick={handleAnalyze}
          disabled={!input}
          className="px-8 py-3 bg-primary text-white font-medium rounded-lg hover:bg-primary-hover disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          バイト列を確認
        </button>
        <button
          onClick={handleClear}
          className="px-6 py-3 border border-border rounded-lg text-sm hover:bg-accent transition-colors"
        >
          クリア
        </button>
        <label className="flex items-center gap-2 cursor-pointer select-none ml-2">
          <input
            type="checkbox"
            checked={autoAnalyze}
            onChange={(e) => {
              setAutoAnalyze(e.target.checked);
              if (e.target.checked && input) analyze(input);
            }}
            className="w-4 h-4 rounded border-border accent-[var(--primary)]"
          />
          <span className="text-sm text-muted">自動解析</span>
        </label>
      </div>

      {/* Detected Encoding */}
      {hasResults && detectedEncoding && (
        <div className="flex items-center gap-2 px-4 py-3 rounded-lg bg-accent/50 border border-border text-sm">
          <svg className="w-4 h-4 text-primary flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="text-muted">文字コード判定：</span>
          <span className="font-medium text-foreground">{detectedEncoding}</span>
        </div>
      )}

      {/* Results */}
      {hasResults && (
        <div className="space-y-4">
          <h2 className="text-sm font-semibold text-foreground">各エンコーディングのバイト列</h2>
          {results.map((result) => (
            <div
              key={result.encoding}
              className={`rounded-lg border p-4 ${ENCODING_COLORS[result.encoding]}`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${ENCODING_BADGE[result.encoding]}`}>
                    {ENCODING_LABELS[result.encoding]}
                  </span>
                  {result.supported && result.bytes > 0 && (
                    <span className="text-xs opacity-70">{result.bytes} バイト</span>
                  )}
                </div>
                <button
                  onClick={() => handleCopy(result)}
                  disabled={!result.supported || !result.hex}
                  className="inline-flex items-center gap-1.5 px-3 py-1 text-xs border border-current/20 rounded-md bg-white/50 hover:bg-white/80 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  {copiedEncoding === result.encoding ? (
                    <>
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                      コピー済み
                    </>
                  ) : (
                    <>
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                      コピー
                    </>
                  )}
                </button>
              </div>
              <div className="font-mono text-sm break-all leading-relaxed">
                {result.hex || <span className="opacity-50 italic">（入力なし）</span>}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Byte count comparison table */}
      {hasResults && results.some((r) => r.bytes > 0) && (
        <div className="rounded-lg border border-border bg-card overflow-hidden">
          <div className="px-4 py-3 border-b border-border bg-accent/30">
            <h3 className="text-sm font-semibold text-foreground">バイト数比較</h3>
          </div>
          <div className="divide-y divide-border">
            {results.map((result) => (
              <div key={result.encoding} className="flex items-center justify-between px-4 py-2.5 text-sm">
                <span className="font-medium text-foreground">{ENCODING_LABELS[result.encoding]}</span>
                <span className="text-muted">
                  {result.supported && result.bytes > 0
                    ? `${result.bytes} バイト`
                    : result.supported
                    ? "0 バイト"
                    : "変換不可"}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    
      {/* FAQ */}
      <section className="mt-12 space-y-4">
        <h2 className="text-lg font-bold text-gray-800">よくある質問</h2>
        <div className="space-y-3">
    <details className="bg-gray-50 rounded-lg p-4 open:bg-gray-100">
      <summary className="font-medium text-gray-700 cursor-pointer select-none">この文字コード変換ツールは何ができますか？</summary>
      <p className="mt-2 text-sm text-gray-600">UTF-8, Shift_JIS, EUC-JP間の文字コード変換とエンコード確認。入力するだけで即座に結果を表示します。</p>
    </details>
    <details className="bg-gray-50 rounded-lg p-4 open:bg-gray-100">
      <summary className="font-medium text-gray-700 cursor-pointer select-none">利用料金はかかりますか？</summary>
      <p className="mt-2 text-sm text-gray-600">完全無料でご利用いただけます。会員登録も不要です。</p>
    </details>
    <details className="bg-gray-50 rounded-lg p-4 open:bg-gray-100">
      <summary className="font-medium text-gray-700 cursor-pointer select-none">計算結果は正確ですか？</summary>
      <p className="mt-2 text-sm text-gray-600">一般的な計算式に基づいた概算値です。正確な数値が必要な場合は、専門家へのご相談をお勧めします。</p>
    </details>
        </div>
      </section>
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify({"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [{"@type": "Question", "name": "この文字コード変換ツールは何ができますか？", "acceptedAnswer": {"@type": "Answer", "text": "UTF-8, Shift_JIS, EUC-JP間の文字コード変換とエンコード確認。入力するだけで即座に結果を表示します。"}}, {"@type": "Question", "name": "利用料金はかかりますか？", "acceptedAnswer": {"@type": "Answer", "text": "完全無料でご利用いただけます。会員登録も不要です。"}}, {"@type": "Question", "name": "計算結果は正確ですか？", "acceptedAnswer": {"@type": "Answer", "text": "一般的な計算式に基づいた概算値です。正確な数値が必要な場合は、専門家へのご相談をお勧めします。"}}]})}} />
      </div>
  );
}
