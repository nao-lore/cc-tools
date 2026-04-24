"use client";

import { useState, useCallback } from "react";
import { shinToKyu, kyuToShin } from "../lib/kyuujitai-dict";

type Direction = "shinToKyu" | "kyuToShin";

function convertText(
  input: string,
  direction: Direction
): { result: string; highlightedChars: Set<number> } {
  const dict = direction === "shinToKyu" ? shinToKyu : kyuToShin;
  let result = "";
  const highlightedChars = new Set<number>();
  let i = 0;
  while (i < input.length) {
    const char = input[i];
    if (dict[char]) {
      highlightedChars.add(result.length);
      result += dict[char];
    } else {
      result += char;
    }
    i++;
  }
  return { result, highlightedChars };
}

const SAMPLE_TEXT_SHIN = "国会議員が経済政策について発表した。学校教育の改革も重要な問題だ。";
const SAMPLE_TEXT_KYU = "國會議員が經濟政策について發表した。學校教育の改革も重要な問題だ。";

export default function KyuujitaiConverter() {
  const [input, setInput] = useState("");
  const [direction, setDirection] = useState<Direction>("shinToKyu");
  const [converted, setConverted] = useState<{
    result: string;
    highlightedChars: Set<number>;
  } | null>(null);
  const [copied, setCopied] = useState(false);

  const handleConvert = useCallback(() => {
    if (!input.trim()) return;
    const out = convertText(input, direction);
    setConverted(out);
    setCopied(false);
  }, [input, direction]);

  const handleCopy = useCallback(async () => {
    if (!converted) return;
    try {
      await navigator.clipboard.writeText(converted.result);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const el = document.createElement("textarea");
      el.value = converted.result;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [converted]);

  const handleSample = useCallback(() => {
    setInput(direction === "shinToKyu" ? SAMPLE_TEXT_SHIN : SAMPLE_TEXT_KYU);
    setConverted(null);
  }, [direction]);

  const handleClear = useCallback(() => {
    setInput("");
    setConverted(null);
    setCopied(false);
  }, []);

  const handleDirectionChange = useCallback((dir: Direction) => {
    setDirection(dir);
    setConverted(null);
    setInput("");
  }, []);

  const countConverted = converted ? converted.highlightedChars.size : 0;

  return (
    <div className="space-y-6">
      {/* Direction Toggle */}
      <div>
        <p className="text-sm font-semibold text-gray-700 mb-3">変換方向</p>
        <div className="grid grid-cols-2 gap-3">
          {(
            [
              { value: "shinToKyu", label: "新字体 → 旧字体", example: "学 → 學" },
              { value: "kyuToShin", label: "旧字体 → 新字体", example: "學 → 学" },
            ] as const
          ).map((opt) => (
            <button
              key={opt.value}
              onClick={() => handleDirectionChange(opt.value)}
              className={`p-3 rounded-xl border-2 text-left transition-all ${
                direction === opt.value
                  ? "border-indigo-500 bg-indigo-50 shadow-sm"
                  : "border-gray-200 hover:border-gray-300 bg-white"
              }`}
            >
              <span className="block text-sm font-semibold text-gray-800">{opt.label}</span>
              <span className="block text-xs text-gray-500 mt-1 font-mono">{opt.example}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Input */}
      <div>
        <label htmlFor="input-text" className="block text-sm font-semibold text-gray-700 mb-2">
          変換するテキストを入力
        </label>
        <textarea
          id="input-text"
          value={input}
          onChange={(e) => {
            setInput(e.target.value);
            setConverted(null);
          }}
          placeholder={
            direction === "shinToKyu"
              ? "新字体のテキストを入力してください..."
              : "旧字体のテキストを入力してください..."
          }
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

      {/* Convert Button */}
      <button
        onClick={handleConvert}
        disabled={!input.trim()}
        className="w-full py-3 px-6 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 active:bg-indigo-800 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors text-lg shadow-md hover:shadow-lg"
      >
        変換する
      </button>

      {/* Result */}
      {converted && (
        <div className="space-y-4">
          {/* Stats */}
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-amber-50 border border-amber-200 rounded-lg text-amber-700 font-medium">
              <span className="w-3 h-3 bg-amber-300 rounded-sm inline-block" />
              {countConverted}文字変換
            </span>
          </div>

          {/* Highlighted output */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-sm font-semibold text-gray-700">変換結果</h2>
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
            </div>
            <div className="p-4 bg-white border-2 border-gray-200 rounded-xl min-h-[80px]">
              <p className="text-base text-gray-900 leading-relaxed whitespace-pre-wrap break-all">
                {converted.result.split("").map((char, idx) => (
                  converted.highlightedChars.has(idx) ? (
                    <mark
                      key={idx}
                      className="bg-amber-200 text-amber-900 rounded px-0.5"
                    >
                      {char}
                    </mark>
                  ) : (
                    <span key={idx}>{char}</span>
                  )
                ))}
              </p>
            </div>
          </div>

          {/* Raw text output */}
          <div>
            <h2 className="text-sm font-semibold text-gray-700 mb-2">テキスト出力（コピー用）</h2>
            <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl">
              <pre className="whitespace-pre-wrap break-all text-sm text-gray-800 font-mono">
                {converted.result}
              </pre>
            </div>
          </div>

          <p className="text-xs text-gray-500 text-center">
            ※ 変換された文字はオレンジでハイライト表示されます。辞書にない文字はそのまま出力されます。
          </p>
        </div>
      )}
    
      {/* FAQ */}
      <section className="mt-12 space-y-4">
        <h2 className="text-lg font-bold text-gray-800">よくある質問</h2>
        <div className="space-y-3">
    <details className="bg-gray-50 rounded-lg p-4 open:bg-gray-100">
      <summary className="font-medium text-gray-700 cursor-pointer select-none">この旧字体変換ツールは何ができますか？</summary>
      <p className="mt-2 text-sm text-gray-600">新字体と旧字体を相互変換。入力するだけで即座に結果を表示します。</p>
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
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify({"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [{"@type": "Question", "name": "この旧字体変換ツールは何ができますか？", "acceptedAnswer": {"@type": "Answer", "text": "新字体と旧字体を相互変換。入力するだけで即座に結果を表示します。"}}, {"@type": "Question", "name": "利用料金はかかりますか？", "acceptedAnswer": {"@type": "Answer", "text": "完全無料でご利用いただけます。会員登録も不要です。"}}, {"@type": "Question", "name": "計算結果は正確ですか？", "acceptedAnswer": {"@type": "Answer", "text": "一般的な計算式に基づいた概算値です。正確な数値が必要な場合は、専門家へのご相談をお勧めします。"}}]})}} />
      
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: `{
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "旧字体変換",
  "description": "新字体と旧字体を相互変換",
  "url": "https://tools.loresync.dev/kyuujitai",
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
