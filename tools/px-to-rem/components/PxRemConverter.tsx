"use client";

import { useState, useCallback } from "react";

const COMMON_SIZES = [8, 10, 12, 14, 16, 18, 20, 24, 32, 48, 64];

export default function PxRemConverter() {
  const [baseFontSize, setBaseFontSize] = useState(16);
  const [pxValue, setPxValue] = useState("16");
  const [remValue, setRemValue] = useState("1");
  const [bulkInput, setBulkInput] = useState("");
  const [bulkOutput, setBulkOutput] = useState("");
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const pxToRem = useCallback(
    (px: number) => +(px / baseFontSize).toFixed(6).replace(/\.?0+$/, ""),
    [baseFontSize]
  );

  const remToPx = useCallback(
    (rem: number) => +(rem * baseFontSize).toFixed(6).replace(/\.?0+$/, ""),
    [baseFontSize]
  );

  const handlePxChange = (value: string) => {
    setPxValue(value);
    const num = parseFloat(value);
    if (!isNaN(num)) {
      setRemValue(String(pxToRem(num)));
    } else {
      setRemValue("");
    }
  };

  const handleRemChange = (value: string) => {
    setRemValue(value);
    const num = parseFloat(value);
    if (!isNaN(num)) {
      setPxValue(String(remToPx(num)));
    } else {
      setPxValue("");
    }
  };

  const handleBaseChange = (value: string) => {
    const num = parseFloat(value);
    if (!isNaN(num) && num > 0) {
      setBaseFontSize(num);
      const px = parseFloat(pxValue);
      if (!isNaN(px)) {
        setRemValue(String(+(px / num).toFixed(6).replace(/\.?0+$/, "")));
      }
    }
  };

  const handleBulkConvert = () => {
    const values = bulkInput
      .split(/[\s,;]+/)
      .map((v) => v.replace(/px$/i, "").trim())
      .filter((v) => v !== "");

    const results = values.map((v) => {
      const num = parseFloat(v);
      if (isNaN(num)) return `${v} → invalid`;
      return `${num}px → ${pxToRem(num)}rem`;
    });

    setBulkOutput(results.join("\n"));
  };

  const copyToClipboard = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 1500);
    } catch {
      // fallback
    }
  };

  return (
    <div className="space-y-8">
      {/* Base Font Size */}
      <div className="flex items-center justify-center gap-3">
        <label className="text-sm font-medium text-gray-600">
          Base font size:
        </label>
        <input
          type="number"
          value={baseFontSize}
          onChange={(e) => handleBaseChange(e.target.value)}
          min={1}
          className="w-20 px-3 py-2 border border-gray-300 rounded-lg text-center text-sm font-mono focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-gray-400"
        />
        <span className="text-sm text-gray-500">px</span>
      </div>

      {/* Two-way Converter */}
      <div className="flex flex-col sm:flex-row items-center gap-4 justify-center">
        <div className="flex-1 max-w-xs w-full">
          <label className="block text-sm font-medium text-gray-600 mb-1.5 text-center">
            Pixels (px)
          </label>
          <div className="relative">
            <input
              type="number"
              value={pxValue}
              onChange={(e) => handlePxChange(e.target.value)}
              placeholder="16"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg text-lg font-mono text-center focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-gray-400"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">
              px
            </span>
          </div>
        </div>

        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-100 text-gray-400 text-lg font-bold mt-5 sm:mt-6 shrink-0">
          ⇄
        </div>

        <div className="flex-1 max-w-xs w-full">
          <label className="block text-sm font-medium text-gray-600 mb-1.5 text-center">
            REM
          </label>
          <div className="relative">
            <input
              type="number"
              value={remValue}
              onChange={(e) => handleRemChange(e.target.value)}
              placeholder="1"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg text-lg font-mono text-center focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-gray-400"
            />
            <button
              onClick={() =>
                copyToClipboard(remValue ? `${remValue}rem` : "", "rem")
              }
              className="absolute right-2 top-1/2 -translate-y-1/2 px-2 py-1 text-xs text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded transition-colors"
              title="Copy REM value"
            >
              {copiedField === "rem" ? "Copied!" : "Copy"}
            </button>
          </div>
        </div>
      </div>

      {/* Quick Reference Table */}
      <div>
        <h2 className="text-lg font-semibold text-gray-800 mb-3 text-center">
          Quick Reference
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full max-w-lg mx-auto text-sm border border-gray-200 rounded-lg overflow-hidden">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-4 py-2.5 text-left font-medium text-gray-600 border-b border-gray-200">
                  Pixels
                </th>
                <th className="px-4 py-2.5 text-left font-medium text-gray-600 border-b border-gray-200">
                  REM
                </th>
                <th className="px-4 py-2.5 text-right font-medium text-gray-600 border-b border-gray-200"></th>
              </tr>
            </thead>
            <tbody>
              {COMMON_SIZES.map((size) => {
                const rem = pxToRem(size);
                return (
                  <tr
                    key={size}
                    className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-4 py-2 font-mono text-gray-800">
                      {size}px
                    </td>
                    <td className="px-4 py-2 font-mono text-gray-800">
                      {rem}rem
                    </td>
                    <td className="px-4 py-2 text-right">
                      <button
                        onClick={() =>
                          copyToClipboard(`${rem}rem`, `table-${size}`)
                        }
                        className="text-xs text-gray-400 hover:text-gray-700 hover:bg-gray-100 px-2 py-0.5 rounded transition-colors"
                      >
                        {copiedField === `table-${size}` ? "Copied!" : "Copy"}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bulk Converter */}
      <div className="max-w-lg mx-auto">
        <h2 className="text-lg font-semibold text-gray-800 mb-3 text-center">
          Bulk Converter
        </h2>
        <p className="text-sm text-gray-500 mb-3 text-center">
          Paste multiple px values separated by spaces, commas, or newlines.
        </p>
        <textarea
          value={bulkInput}
          onChange={(e) => setBulkInput(e.target.value)}
          placeholder="16 24 32 48 64"
          rows={3}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg font-mono text-sm focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-gray-400 resize-none"
        />
        <button
          onClick={handleBulkConvert}
          className="mt-2 w-full px-4 py-2.5 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors"
        >
          Convert All
        </button>
        {bulkOutput && (
          <div className="mt-3 relative">
            <pre className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg font-mono text-sm text-gray-700 whitespace-pre-wrap">
              {bulkOutput}
            </pre>
            <button
              onClick={() => copyToClipboard(bulkOutput, "bulk")}
              className="absolute top-2 right-2 px-2 py-1 text-xs text-gray-500 hover:text-gray-700 hover:bg-white rounded border border-gray-200 transition-colors"
            >
              {copiedField === "bulk" ? "Copied!" : "Copy All"}
            </button>
          </div>
        )}
      </div>

      {/* FAQ */}
      <div className="mt-6 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">よくある質問</h2>
        <div className="space-y-4">
          {[
            { q: "remとpxの違いは何ですか？", a: "pxはピクセル単位の絶対値です。remはルート要素（html）のフォントサイズを基準にした相対単位です。ブラウザのデフォルトは16pxなので、1rem = 16pxになります。" },
            { q: "なぜCSSでremを使うべきですか？", a: "remを使うとユーザーがブラウザのフォントサイズ設定を変更した際にレイアウトが適切にスケールします。アクセシビリティ向上や、レスポンシブデザインの実装に有効です。" },
            { q: "ベースフォントサイズはどこで変更しますか？", a: "本ツール上部の「ベースフォントサイズ」入力欄で変更できます。プロジェクトのhtml要素に指定したfont-sizeに合わせて設定してください。" },
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
              { "@type": "Question", "name": "remとpxの違いは何ですか？", "acceptedAnswer": { "@type": "Answer", "text": "pxはピクセル単位の絶対値です。remはルート要素のフォントサイズを基準にした相対単位で、デフォルトは1rem=16pxです。" } },
              { "@type": "Question", "name": "なぜCSSでremを使うべきですか？", "acceptedAnswer": { "@type": "Answer", "text": "remを使うとユーザーのフォントサイズ設定に応じてレイアウトが適切にスケールし、アクセシビリティが向上します。" } },
              { "@type": "Question", "name": "ベースフォントサイズはどこで変更しますか？", "acceptedAnswer": { "@type": "Answer", "text": "本ツール上部のベースフォントサイズ入力欄で変更できます。" } },
            ]
          }) }}
        />
        <div className="mt-6 pt-4 border-t border-gray-100">
          <p className="text-sm font-medium text-gray-500 mb-2">関連ツール</p>
          <div className="flex flex-wrap gap-2">
            <a href="/tailwindconvert" className="text-sm text-blue-600 hover:underline bg-blue-50 px-3 py-1.5 rounded-lg">Tailwind CSS 変換</a>
            <a href="/css-box-shadow" className="text-sm text-blue-600 hover:underline bg-blue-50 px-3 py-1.5 rounded-lg">CSS ボックスシャドウ</a>
          </div>
        </div>
      </div>
    </div>
  );
}
