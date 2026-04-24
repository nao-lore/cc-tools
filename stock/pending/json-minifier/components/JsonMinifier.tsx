"use client";

import { useState, useCallback } from "react";

const COPY_ICON = (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" strokeWidth="2" />
    <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" strokeWidth="2" />
  </svg>
);

const CHECK_ICON = (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <polyline points="20 6 9 17 4 12" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

function byteSize(str: string): number {
  return new TextEncoder().encode(str).length;
}

function formatBytes(n: number): string {
  if (n < 1024) return `${n} B`;
  return `${(n / 1024).toFixed(2)} KB`;
}

export default function JsonMinifier() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [mode, setMode] = useState<"minify" | "beautify" | null>(null);

  const process = useCallback(
    (type: "minify" | "beautify") => {
      setError("");
      setCopied(false);
      if (!input.trim()) {
        setError("Please enter some JSON.");
        setOutput("");
        return;
      }
      let parsed: unknown;
      try {
        parsed = JSON.parse(input);
      } catch (e) {
        setError(`Invalid JSON: ${(e as Error).message}`);
        setOutput("");
        setMode(null);
        return;
      }
      const result =
        type === "minify"
          ? JSON.stringify(parsed)
          : JSON.stringify(parsed, null, 2);
      setOutput(result);
      setMode(type);
    },
    [input]
  );

  const handleCopy = useCallback(async () => {
    if (!output) return;
    await navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }, [output]);

  const origBytes = input ? byteSize(input) : 0;
  const outBytes = output ? byteSize(output) : 0;
  const savings =
    origBytes > 0 && outBytes > 0 && mode === "minify"
      ? Math.max(0, ((origBytes - outBytes) / origBytes) * 100)
      : null;

  return (
    <div className="space-y-6">
      {/* Input */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-semibold text-gray-700">Input JSON</label>
          {origBytes > 0 && (
            <span className="text-xs text-gray-400 font-mono">{formatBytes(origBytes)}</span>
          )}
        </div>
        <textarea
          value={input}
          onChange={(e) => {
            setInput(e.target.value);
            setOutput("");
            setError("");
            setMode(null);
          }}
          placeholder={`Paste your JSON here...\n{\n  "example": true,\n  "count": 42\n}`}
          rows={10}
          className="w-full px-3 py-2.5 border border-gray-300 rounded-lg font-mono text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-colors resize-y"
          spellCheck={false}
          autoComplete="off"
        />

        {error && (
          <p className="mt-2 text-xs text-red-500 font-mono break-all">{error}</p>
        )}

        <div className="flex gap-3 mt-4">
          <button
            onClick={() => process("minify")}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition-colors"
          >
            Minify
          </button>
          <button
            onClick={() => process("beautify")}
            className="px-5 py-2.5 bg-gray-700 hover:bg-gray-800 text-white text-sm font-semibold rounded-lg transition-colors"
          >
            Beautify
          </button>
        </div>
      </div>

      {/* Stats */}
      {output && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <div className="bg-white border border-gray-200 rounded-xl px-4 py-3 shadow-sm text-center">
            <p className="text-xs text-gray-500 mb-1">Original size</p>
            <p className="font-mono text-sm font-semibold text-gray-900">{formatBytes(origBytes)}</p>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl px-4 py-3 shadow-sm text-center">
            <p className="text-xs text-gray-500 mb-1">Output size</p>
            <p className="font-mono text-sm font-semibold text-gray-900">{formatBytes(outBytes)}</p>
          </div>
          {savings !== null ? (
            <div className="col-span-2 sm:col-span-1 bg-green-50 border border-green-200 rounded-xl px-4 py-3 shadow-sm text-center">
              <p className="text-xs text-green-600 mb-1">Savings</p>
              <p className="font-mono text-sm font-semibold text-green-700">{savings.toFixed(1)}%</p>
            </div>
          ) : (
            <div className="col-span-2 sm:col-span-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 shadow-sm text-center">
              <p className="text-xs text-gray-500 mb-1">Mode</p>
              <p className="text-sm font-semibold text-gray-700 capitalize">{mode}</p>
            </div>
          )}
        </div>
      )}

      {/* Output */}
      {output && (
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-semibold text-gray-700">
              {mode === "minify" ? "Minified JSON" : "Beautified JSON"}
            </label>
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-600 hover:text-gray-900 border border-gray-300 hover:border-gray-400 rounded-lg transition-colors"
            >
              {copied ? CHECK_ICON : COPY_ICON}
              {copied ? "Copied!" : "Copy"}
            </button>
          </div>
          <textarea
            value={output}
            readOnly
            rows={mode === "minify" ? 4 : 12}
            className="w-full px-3 py-2.5 border border-gray-200 rounded-lg font-mono text-sm bg-gray-50 outline-none resize-y text-gray-800"
            spellCheck={false}
          />
        </div>
      )}

      {/* Ad placeholder */}
      <div className="bg-gray-100 border border-dashed border-gray-300 rounded-xl h-24 flex items-center justify-center">
        <span className="text-xs text-gray-400">Advertisement</span>
      </div>
    
      {/* FAQ */}
      <section className="mt-12 space-y-4">
        <h2 className="text-lg font-bold text-gray-800">Frequently Asked Questions</h2>
        <div className="space-y-3">
    <details className="bg-gray-50 rounded-lg p-4 open:bg-gray-100">
      <summary className="font-medium text-gray-700 cursor-pointer select-none">What does this JSON Minifier tool do?</summary>
      <p className="mt-2 text-sm text-gray-600">Remove all whitespace from JSON to minimize file size. Just enter your values and get instant results.</p>
    </details>
    <details className="bg-gray-50 rounded-lg p-4 open:bg-gray-100">
      <summary className="font-medium text-gray-700 cursor-pointer select-none">Is this tool free to use?</summary>
      <p className="mt-2 text-sm text-gray-600">Yes, completely free. No sign-up or account required.</p>
    </details>
    <details className="bg-gray-50 rounded-lg p-4 open:bg-gray-100">
      <summary className="font-medium text-gray-700 cursor-pointer select-none">How accurate are the results?</summary>
      <p className="mt-2 text-sm text-gray-600">Results are estimates based on standard formulas. For critical decisions, please consult a qualified professional.</p>
    </details>
        </div>
      </section>
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify({"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [{"@type": "Question", "name": "What does this JSON Minifier tool do?", "acceptedAnswer": {"@type": "Answer", "text": "Remove all whitespace from JSON to minimize file size. Just enter your values and get instant results."}}, {"@type": "Question", "name": "Is this tool free to use?", "acceptedAnswer": {"@type": "Answer", "text": "Yes, completely free. No sign-up or account required."}}, {"@type": "Question", "name": "How accurate are the results?", "acceptedAnswer": {"@type": "Answer", "text": "Results are estimates based on standard formulas. For critical decisions, please consult a qualified professional."}}]})}} />
      </div>
  );
}
