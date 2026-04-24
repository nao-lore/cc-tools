"use client";

import { useState, useCallback } from "react";
import { convert, type ConversionOptions } from "../lib/converter";

export default function Converter() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [direction, setDirection] = useState<"toHalf" | "toFull">("toHalf");
  const [autoConvert, setAutoConvert] = useState(false);
  const [copied, setCopied] = useState(false);
  const [options, setOptions] = useState<ConversionOptions>({
    katakana: true,
    alphanumeric: true,
    symbol: true,
    space: true,
  });

  const doConvert = useCallback(
    (text: string, dir: "toHalf" | "toFull", opts: ConversionOptions) => {
      setOutput(convert(text, dir, opts));
    },
    []
  );

  const handleInputChange = (value: string) => {
    setInput(value);
    if (autoConvert) {
      doConvert(value, direction, options);
    }
  };

  const handleOptionChange = (key: keyof ConversionOptions) => {
    const newOptions = { ...options, [key]: !options[key] };
    setOptions(newOptions);
    if (autoConvert && input) {
      doConvert(input, direction, newOptions);
    }
  };

  const handleDirectionChange = (dir: "toHalf" | "toFull") => {
    setDirection(dir);
    if (autoConvert && input) {
      doConvert(input, dir, options);
    }
  };

  const handleAutoConvertChange = (checked: boolean) => {
    setAutoConvert(checked);
    if (checked && input) {
      doConvert(input, direction, options);
    }
  };

  const handleConvert = () => {
    doConvert(input, direction, options);
  };

  const handleCopy = async () => {
    if (!output) return;
    try {
      await navigator.clipboard.writeText(output);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
      const textarea = document.createElement("textarea");
      textarea.value = output;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleClear = () => {
    setInput("");
    setOutput("");
  };

  const optionItems: { key: keyof ConversionOptions; label: string }[] = [
    { key: "katakana", label: "カタカナ" },
    { key: "alphanumeric", label: "英数字" },
    { key: "symbol", label: "記号" },
    { key: "space", label: "スペース" },
  ];

  return (
    <div className="space-y-6">
      {/* Direction Toggle */}
      <div className="flex justify-center">
        <div className="inline-flex rounded-lg border border-border overflow-hidden">
          <button
            onClick={() => handleDirectionChange("toHalf")}
            className={`px-5 py-2.5 text-sm font-medium transition-colors ${
              direction === "toHalf"
                ? "bg-primary text-white"
                : "bg-card text-foreground hover:bg-accent"
            }`}
          >
            全角 → 半角
          </button>
          <button
            onClick={() => handleDirectionChange("toFull")}
            className={`px-5 py-2.5 text-sm font-medium transition-colors ${
              direction === "toFull"
                ? "bg-primary text-white"
                : "bg-card text-foreground hover:bg-accent"
            }`}
          >
            半角 → 全角
          </button>
        </div>
      </div>

      {/* Conversion Options */}
      <div className="flex flex-wrap justify-center gap-4">
        {optionItems.map(({ key, label }) => (
          <label
            key={key}
            className="flex items-center gap-2 cursor-pointer select-none"
          >
            <input
              type="checkbox"
              checked={options[key]}
              onChange={() => handleOptionChange(key)}
              className="w-4 h-4 rounded border-border text-primary focus:ring-primary accent-[var(--primary)]"
            />
            <span className="text-sm">{label}</span>
          </label>
        ))}
      </div>

      {/* Input Area */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-medium text-muted">
            変換前テキスト
          </label>
          <span className="text-xs text-muted">
            {input.length} 文字
          </span>
        </div>
        <textarea
          value={input}
          onChange={(e) => handleInputChange(e.target.value)}
          placeholder="ここにテキストを入力またはペーストしてください..."
          rows={6}
          className="w-full rounded-lg border border-border bg-card p-4 text-base resize-y focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors placeholder:text-muted/50"
        />
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap items-center justify-center gap-3">
        <button
          onClick={handleConvert}
          disabled={!input}
          className="px-8 py-3 bg-primary text-white font-medium rounded-lg hover:bg-primary-hover disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          変換する
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
            checked={autoConvert}
            onChange={(e) => handleAutoConvertChange(e.target.checked)}
            className="w-4 h-4 rounded border-border text-primary focus:ring-primary accent-[var(--primary)]"
          />
          <span className="text-sm text-muted">自動変換</span>
        </label>
      </div>

      {/* Output Area */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-medium text-muted">
            変換後テキスト
          </label>
          <div className="flex items-center gap-3">
            <span className="text-xs text-muted">
              {output.length} 文字
            </span>
            <button
              onClick={handleCopy}
              disabled={!output}
              className="inline-flex items-center gap-1.5 px-3 py-1 text-xs border border-border rounded-md hover:bg-accent disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              {copied ? (
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
        </div>
        <textarea
          value={output}
          readOnly
          placeholder="変換結果がここに表示されます"
          rows={6}
          className="w-full rounded-lg border border-border bg-accent/50 p-4 text-base resize-y focus:outline-none placeholder:text-muted/50"
        />
      </div>

      {/* FAQ */}
      <div className="mt-6 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">よくある質問</h2>
        <div className="space-y-4">
          {[
            { q: "全角と半角の違いは何ですか？", a: "半角文字は1バイト（英数字・記号など）、全角文字は2バイト（漢字・ひらがな・全角英数など）の幅を持ちます。フォントによっては見た目の幅が2倍になります。フォームへの入力制限やデータ処理で変換が必要になることがあります。" },
            { q: "全角カタカナと半角カタカナはどう使い分けますか？", a: "現代のWebやシステムでは通常全角カタカナが使われます。半角カタカナは古いシステム（JIS規格）との互換性のために使われることがありますが、文字化けの原因になる場合もあるため、新しいシステムでは全角を推奨します。" },
            { q: "スペースも変換されますか？", a: "はい。「スペース」のオプションを有効にすると、全角スペース（　）と半角スペース（ ）も変換されます。変換したくない要素はオプションで個別にオフにできます。" },
          ].map(({ q, a }) => (
            <div key={q} className="bg-gray-50 rounded-xl p-4">
              <p className="font-medium text-gray-800 mb-1">Q. {q}</p>
              <p className="text-sm text-gray-600">A. {a}</p>
            </div>
          ))}
        </div>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": [
              { "@type": "Question", "name": "全角と半角の違いは何ですか？", "acceptedAnswer": { "@type": "Answer", "text": "半角文字は1バイト（英数字・記号など）、全角文字は2バイト（漢字・ひらがな・全角英数など）の幅を持ちます。" } },
              { "@type": "Question", "name": "全角カタカナと半角カタカナはどう使い分けますか？", "acceptedAnswer": { "@type": "Answer", "text": "現代のWebでは通常全角カタカナが使われます。半角カタカナは古いシステムとの互換性のためですが、文字化けの原因になる場合もあります。" } },
              { "@type": "Question", "name": "スペースも変換されますか？", "acceptedAnswer": { "@type": "Answer", "text": "はい。スペースのオプションを有効にすると全角スペースと半角スペースも変換されます。" } },
            ]
          }) }}
        />
        <div className="mt-6 pt-4 border-t border-gray-100">
          <p className="text-sm font-medium text-gray-500 mb-2">関連ツール</p>
          <div className="flex flex-wrap gap-2">
            <a href="/word-counter" className="text-sm text-blue-600 hover:underline bg-blue-50 px-3 py-1.5 rounded-lg">文字数カウンター</a>
            <a href="/text-diff" className="text-sm text-blue-600 hover:underline bg-blue-50 px-3 py-1.5 rounded-lg">テキスト差分ツール</a>
          </div>
        </div>
      </div>
    </div>
  );
}
