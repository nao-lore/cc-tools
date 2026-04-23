"use client";

import { useState, useCallback } from "react";
import { convertToFurigana, type OutputMode } from "../lib/converter";

const OUTPUT_MODES: { value: OutputMode; label: string; description: string }[] = [
  { value: "ruby", label: "ルビ表示（HTML）", description: "<ruby>漢字<rt>かんじ</rt></ruby>" },
  { value: "parenthetical", label: "括弧表示", description: "漢字(かんじ)" },
  { value: "hiragana", label: "ひらがなのみ", description: "すべてひらがなに変換" },
];

const SAMPLE_TEXT = "日本語の勉強は毎日の練習が大切です。漢字の読書を通じて語彙力を高めましょう。先生に質問して理解を深めることが重要です。";

export default function FuriganaConverter() {
  const [input, setInput] = useState("");
  const [mode, setMode] = useState<OutputMode>("ruby");
  const [result, setResult] = useState<{ formatted: string; segments: { text: string; reading: string | null }[] } | null>(null);
  const [copied, setCopied] = useState(false);

  const handleConvert = useCallback(() => {
    if (!input.trim()) return;
    const converted = convertToFurigana(input, mode);
    setResult(converted);
    setCopied(false);
  }, [input, mode]);

  const handleCopy = useCallback(async () => {
    if (!result) return;
    try {
      await navigator.clipboard.writeText(result.formatted);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
      const textarea = document.createElement("textarea");
      textarea.value = result.formatted;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [result]);

  const handleSample = useCallback(() => {
    setInput(SAMPLE_TEXT);
  }, []);

  const handleClear = useCallback(() => {
    setInput("");
    setResult(null);
    setCopied(false);
  }, []);

  // Render preview with ruby tags
  const renderPreview = () => {
    if (!result) return null;

    return (
      <div
        className="leading-loose text-base sm:text-lg"
        style={{ lineHeight: "2.2" }}
        dangerouslySetInnerHTML={{
          __html: result.segments
            .map((seg) => {
              if (!seg.reading) {
                return seg.text
                  .replace(/&/g, "&amp;")
                  .replace(/</g, "&lt;")
                  .replace(/>/g, "&gt;")
                  .replace(/\n/g, "<br>");
              }
              return `<ruby>${seg.text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")}<rt>${seg.reading}</rt></ruby>`;
            })
            .join(""),
        }}
      />
    );
  };

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
          className="w-full h-32 sm:h-40 p-3 sm:p-4 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-colors resize-y text-sm sm:text-base text-gray-900 placeholder-gray-400"
        />
        <div className="flex gap-2 mt-2">
          <button
            onClick={handleSample}
            className="text-sm text-blue-600 hover:text-blue-800 underline underline-offset-2"
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

      {/* Output Mode Selection */}
      <div>
        <p className="text-sm font-semibold text-gray-700 mb-3">出力形式を選択</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {OUTPUT_MODES.map((m) => (
            <button
              key={m.value}
              onClick={() => {
                setMode(m.value);
                if (result && input.trim()) {
                  setResult(convertToFurigana(input, m.value));
                  setCopied(false);
                }
              }}
              className={`p-3 rounded-xl border-2 text-left transition-all ${
                mode === m.value
                  ? "border-blue-500 bg-blue-50 shadow-sm"
                  : "border-gray-200 hover:border-gray-300 bg-white"
              }`}
            >
              <span className="block text-sm font-semibold text-gray-800">{m.label}</span>
              <span className="block text-xs text-gray-500 mt-1 font-mono break-all">{m.description}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Convert Button */}
      <button
        onClick={handleConvert}
        disabled={!input.trim()}
        className="w-full py-3 px-6 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 active:bg-blue-800 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors text-lg shadow-md hover:shadow-lg"
      >
        ふりがなを変換する
      </button>

      {/* Result Section */}
      {result && (
        <div className="space-y-4">
          {/* Visual Preview */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-sm font-semibold text-gray-700">プレビュー</h2>
            </div>
            <div className="p-6 bg-white border-2 border-gray-200 rounded-xl min-h-[80px]">
              {renderPreview()}
            </div>
          </div>

          {/* Raw Output */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-sm font-semibold text-gray-700">
                {mode === "ruby" ? "HTMLコード" : "テキスト出力"}
              </h2>
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
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    コピー
                  </>
                )}
              </button>
            </div>
            <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl">
              <pre className="whitespace-pre-wrap break-all text-sm text-gray-800 font-mono">
                {result.formatted}
              </pre>
            </div>
          </div>

          {/* Note about coverage */}
          <p className="text-xs text-gray-500 text-center">
            ※ この変換ツールは内蔵辞書（500語以上）を使用しています。辞書にない漢字はそのまま表示されます。
          </p>
        </div>
      )}
    </div>
  );
}
