"use client";

import { useState, useCallback } from "react";

const SAMPLE_TEXT = "吾輩は猫である。名前はまだ無い。\nどこで生れたかとんと見当がつかぬ。\n何でも薄暗いじめじめした所でニャーニャー泣いていた事だけは記憶している。";

const FONTS = [
  { value: "serif", label: "明朝体" },
  { value: "sans-serif", label: "ゴシック体" },
] as const;

type FontValue = (typeof FONTS)[number]["value"];

// Build 20×20 manuscript grid cells from text
function buildManuscriptGrid(text: string): string[] {
  const chars = text.replace(/\r\n/g, "\n").split("");
  // Filter to 400 chars max for the 20×20 grid
  return chars.slice(0, 400);
}

export default function TategakiConverter() {
  const [input, setInput] = useState("");
  const [font, setFont] = useState<FontValue>("serif");
  const [fontSize, setFontSize] = useState(20);
  const [lineHeight, setLineHeight] = useState(2.0);
  const [manuscriptMode, setManuscriptMode] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleSample = useCallback(() => {
    setInput(SAMPLE_TEXT);
  }, []);

  const handleClear = useCallback(() => {
    setInput("");
    setCopied(false);
  }, []);

  const handleCopy = useCallback(async () => {
    if (!input.trim()) return;
    try {
      await navigator.clipboard.writeText(input);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const textarea = document.createElement("textarea");
      textarea.value = input;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [input]);

  const manuscriptChars = manuscriptMode ? buildManuscriptGrid(input) : [];

  return (
    <div className="space-y-6">
      {/* Input Section */}
      <div>
        <label htmlFor="input-text" className="block text-sm font-semibold text-gray-700 mb-2">
          変換したいテキストを入力
        </label>
        <textarea
          id="input-text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="ここに日本語のテキストを入力してください..."
          className="w-full h-40 p-4 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-colors resize-y text-base text-gray-900 placeholder-gray-400"
        />
        <div className="flex gap-2 mt-2">
          <button
            onClick={handleSample}
            className="text-sm text-indigo-600 hover:text-indigo-800 underline underline-offset-2"
          >
            サンプルテキストを使う
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

      {/* Controls */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 p-5 bg-gray-50 rounded-xl border border-gray-200">
        {/* Font Selection */}
        <div>
          <p className="text-sm font-semibold text-gray-700 mb-3">フォント</p>
          <div className="flex gap-3">
            {FONTS.map((f) => (
              <button
                key={f.value}
                onClick={() => setFont(f.value)}
                className={`flex-1 py-2 px-4 rounded-lg border-2 text-sm font-medium transition-all ${
                  font === f.value
                    ? "border-indigo-500 bg-indigo-50 text-indigo-700 shadow-sm"
                    : "border-gray-200 bg-white text-gray-700 hover:border-gray-300"
                }`}
                style={{ fontFamily: f.value }}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Manuscript Mode Toggle */}
        <div>
          <p className="text-sm font-semibold text-gray-700 mb-3">表示モード</p>
          <button
            onClick={() => setManuscriptMode((v) => !v)}
            className={`w-full py-2 px-4 rounded-lg border-2 text-sm font-medium transition-all ${
              manuscriptMode
                ? "border-indigo-500 bg-indigo-50 text-indigo-700 shadow-sm"
                : "border-gray-200 bg-white text-gray-700 hover:border-gray-300"
            }`}
          >
            {manuscriptMode ? "原稿用紙風 ON" : "原稿用紙風 OFF"}
          </button>
        </div>

        {/* Font Size Slider */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-semibold text-gray-700">文字サイズ</p>
            <span className="text-sm text-indigo-600 font-mono font-bold">{fontSize}px</span>
          </div>
          <input
            type="range"
            min={12}
            max={48}
            step={2}
            value={fontSize}
            onChange={(e) => setFontSize(Number(e.target.value))}
            className="w-full accent-indigo-600"
          />
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>12px</span>
            <span>48px</span>
          </div>
        </div>

        {/* Line Height Slider */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-semibold text-gray-700">行間</p>
            <span className="text-sm text-indigo-600 font-mono font-bold">{lineHeight.toFixed(1)}</span>
          </div>
          <input
            type="range"
            min={1.0}
            max={4.0}
            step={0.1}
            value={lineHeight}
            onChange={(e) => setLineHeight(Number(e.target.value))}
            className="w-full accent-indigo-600"
          />
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>狭い</span>
            <span>広い</span>
          </div>
        </div>
      </div>

      {/* Preview */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-sm font-semibold text-gray-700">縦書きプレビュー</h2>
          {input.trim() && (
            <button
              onClick={handleCopy}
              className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                copied
                  ? "bg-green-100 text-green-700"
                  : "bg-gray-100 hover:bg-gray-200 text-gray-700"
              }`}
            >
              {copied ? (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  コピー済み
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  コピー
                </>
              )}
            </button>
          )}
        </div>

        <div className="p-6 bg-white border-2 border-gray-200 rounded-xl min-h-[200px] overflow-auto">
          {!input.trim() ? (
            <p className="text-gray-400 text-sm text-center pt-8">
              テキストを入力すると縦書きプレビューが表示されます
            </p>
          ) : manuscriptMode ? (
            /* Manuscript grid: 20 cols × 20 rows, columns run right-to-left */
            <div className="overflow-auto">
              <div
                className="inline-grid gap-0"
                style={{
                  gridTemplateColumns: `repeat(20, ${fontSize + 4}px)`,
                  gridTemplateRows: `repeat(20, ${fontSize + 4}px)`,
                  direction: "rtl",
                }}
              >
                {Array.from({ length: 20 }, (_, col) =>
                  Array.from({ length: 20 }, (_, row) => {
                    // Column-major order (top-to-bottom, right-to-left)
                    const idx = col * 20 + row;
                    const char = manuscriptChars[idx] ?? "";
                    const isNewline = char === "\n";
                    return (
                      <div
                        key={`${col}-${row}`}
                        className="border border-gray-300 flex items-center justify-center"
                        style={{
                          width: fontSize + 4,
                          height: fontSize + 4,
                          fontFamily: font,
                          fontSize,
                          color: isNewline ? "transparent" : "inherit",
                          backgroundColor: isNewline ? "#f9fafb" : "white",
                        }}
                      >
                        {isNewline ? "" : char}
                      
      {/* FAQ */}
      <section className="mt-12 space-y-4">
        <h2 className="text-lg font-bold text-gray-800">よくある質問</h2>
        <div className="space-y-3">
    <details className="bg-gray-50 rounded-lg p-4 open:bg-gray-100">
      <summary className="font-medium text-gray-700 cursor-pointer select-none">この縦書き変換ツールは何ができますか？</summary>
      <p className="mt-2 text-sm text-gray-600">横書きテキストを縦書き表示に変換。入力するだけで即座に結果を表示します。</p>
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
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify({"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [{"@type": "Question", "name": "この縦書き変換ツールは何ができますか？", "acceptedAnswer": {"@type": "Answer", "text": "横書きテキストを縦書き表示に変換。入力するだけで即座に結果を表示します。"}}, {"@type": "Question", "name": "利用料金はかかりますか？", "acceptedAnswer": {"@type": "Answer", "text": "完全無料でご利用いただけます。会員登録も不要です。"}}, {"@type": "Question", "name": "計算結果は正確ですか？", "acceptedAnswer": {"@type": "Answer", "text": "一般的な計算式に基づいた概算値です。正確な数値が必要な場合は、専門家へのご相談をお勧めします。"}}]})}} />
      </div>
                    );
                  })
                )}
              </div>
              {input.replace(/[^\S\n]/g, "").length > 400 && (
                <p className="text-xs text-gray-400 mt-3 text-center">
                  ※ 原稿用紙モードは400字まで表示されます
                </p>
              )}
            </div>
          ) : (
            /* Standard vertical writing */
            <div
              style={{
                writingMode: "vertical-rl",
                fontFamily: font,
                fontSize,
                lineHeight,
                maxHeight: "480px",
                overflowX: "auto",
                textOrientation: "mixed",
                whiteSpace: "pre-wrap",
              }}
            >
              {input}
            </div>
          )}
        </div>
      </div>

      {/* Character count hint */}
      {input.trim() && (
        <p className="text-xs text-gray-400 text-right">
          {input.length} 文字
          {manuscriptMode && input.length > 400 && (
            <span className="ml-2 text-amber-500">（原稿用紙モードは先頭400字を表示）</span>
          )}
        </p>
      )}
    
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: `{
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "縦書き変換",
  "description": "横書きテキストを縦書き表示に変換",
  "url": "https://tools.loresync.dev/tategaki",
  "applicationCategory": "UtilityApplication",
  "operatingSystem": "All",
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "JPY"
  },
  "inLanguage": "ja"
}`
        }}
      />
      </div>
  );
}
