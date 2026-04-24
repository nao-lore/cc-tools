"use client";

import { useState, useCallback, useMemo, useRef } from "react";

type DelimiterOption = "comma" | "tab" | "pipe" | "semicolon" | "custom";

const DELIMITER_OPTIONS: { value: DelimiterOption; label: string; char: string }[] = [
  { value: "comma", label: "Comma ( , )", char: "," },
  { value: "tab", label: "Tab", char: "\t" },
  { value: "pipe", label: "Pipe ( | )", char: "|" },
  { value: "semicolon", label: "Semicolon ( ; )", char: ";" },
  { value: "custom", label: "Custom…", char: "" },
];

function delimChar(option: DelimiterOption, custom: string): string {
  if (option === "custom") return custom || ",";
  return DELIMITER_OPTIONS.find((d) => d.value === option)!.char;
}

function splitLine(line: string, delim: string): string[] {
  if (delim === "") return [line];
  return line.split(delim);
}

function parseText(text: string, delim: string): string[][] {
  if (!text.trim()) return [];
  return text
    .split(/\r?\n/)
    .filter((l) => l.trim() !== "")
    .map((l) => splitLine(l, delim));
}

function formatOutput(rows: string[][], colOrder: number[], delim: string): string {
  return rows
    .map((row) =>
      colOrder
        .map((ci) => row[ci] ?? "")
        .join(delim)
    )
    .join("\n");
}

const SAMPLE = `name,age,city,country\nAlice,30,New York,USA\nBob,25,London,UK\nCharlie,35,Tokyo,Japan\nDiana,28,Paris,France`;

export default function TextColumnarizer() {
  const [inputText, setInputText] = useState("");
  const [inputDelim, setInputDelim] = useState<DelimiterOption>("comma");
  const [inputCustom, setInputCustom] = useState("");
  const [outputDelim, setOutputDelim] = useState<DelimiterOption>("tab");
  const [outputCustom, setOutputCustom] = useState("");
  const [colOrder, setColOrder] = useState<number[]>([]);
  const [copied, setCopied] = useState(false);

  // Drag state
  const dragIndex = useRef<number | null>(null);
  const dragOverIndex = useRef<number | null>(null);

  const inChar = useMemo(() => delimChar(inputDelim, inputCustom), [inputDelim, inputCustom]);
  const outChar = useMemo(() => delimChar(outputDelim, outputCustom), [outputDelim, outputCustom]);

  const parsed = useMemo(() => parseText(inputText, inChar), [inputText, inChar]);

  // Derive column count from widest row
  const colCount = useMemo(() => {
    if (parsed.length === 0) return 0;
    return Math.max(...parsed.map((r) => r.length));
  }, [parsed]);

  // Sync colOrder when colCount changes
  const effectiveColOrder = useMemo(() => {
    if (colOrder.length === colCount) return colOrder;
    // Keep valid existing indices, append new ones
    const valid = colOrder.filter((i) => i < colCount);
    const existing = new Set(valid);
    for (let i = 0; i < colCount; i++) {
      if (!existing.has(i)) valid.push(i);
    }
    return valid;
  }, [colOrder, colCount]);

  const outputText = useMemo(
    () => formatOutput(parsed, effectiveColOrder, outChar),
    [parsed, effectiveColOrder, outChar]
  );

  const rowCount = parsed.length;

  const handleDeleteCol = useCallback(
    (orderIdx: number) => {
      setColOrder((prev) => {
        const base = prev.length === colCount ? prev : effectiveColOrder;
        return base.filter((_, i) => i !== orderIdx);
      });
    },
    [colCount, effectiveColOrder]
  );

  const handleDragStart = useCallback((orderIdx: number) => {
    dragIndex.current = orderIdx;
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent, orderIdx: number) => {
    e.preventDefault();
    dragOverIndex.current = orderIdx;
  }, []);

  const handleDrop = useCallback(() => {
    const from = dragIndex.current;
    const to = dragOverIndex.current;
    if (from === null || to === null || from === to) return;
    setColOrder((prev) => {
      const base = prev.length === colCount ? [...prev] : [...effectiveColOrder];
      const [moved] = base.splice(from, 1);
      base.splice(to, 0, moved);
      return base;
    });
    dragIndex.current = null;
    dragOverIndex.current = null;
  }, [colCount, effectiveColOrder]);

  const handleCopy = useCallback(async () => {
    if (!outputText) return;
    await navigator.clipboard.writeText(outputText);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }, [outputText]);

  const handleDownload = useCallback(() => {
    if (!outputText) return;
    const blob = new Blob([outputText], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "columnarized.txt";
    a.click();
    URL.revokeObjectURL(url);
  }, [outputText]);

  const handleReset = useCallback(() => {
    setColOrder([]);
  }, []);

  const hasCustomColOrder =
    colOrder.length > 0 &&
    (colOrder.length !== colCount || colOrder.some((v, i) => v !== i));

  return (
    <div className="space-y-6">
      {/* Input */}
      <div className="space-y-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <label className="text-sm font-semibold text-gray-700">Input Text</label>
          <button
            onClick={() => { setInputText(SAMPLE); setColOrder([]); }}
            className="text-xs text-blue-600 hover:text-blue-800"
          >
            Load sample
          </button>
        </div>
        <textarea
          value={inputText}
          onChange={(e) => { setInputText(e.target.value); setColOrder([]); }}
          placeholder="Paste delimited text here..."
          className="w-full h-36 p-4 border border-gray-300 rounded-lg font-mono text-sm bg-white text-gray-800 resize-y focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-gray-400"
          spellCheck={false}
        />
      </div>

      {/* Delimiter controls */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Input delimiter */}
        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-700">Input Delimiter</label>
          <select
            value={inputDelim}
            onChange={(e) => { setInputDelim(e.target.value as DelimiterOption); setColOrder([]); }}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-300"
          >
            {DELIMITER_OPTIONS.map((d) => (
              <option key={d.value} value={d.value}>{d.label}</option>
            ))}
          </select>
          {inputDelim === "custom" && (
            <input
              type="text"
              maxLength={10}
              value={inputCustom}
              onChange={(e) => { setInputCustom(e.target.value); setColOrder([]); }}
              placeholder="Enter delimiter…"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-300"
            />
          )}
        </div>

        {/* Output delimiter */}
        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-700">Output Delimiter</label>
          <select
            value={outputDelim}
            onChange={(e) => setOutputDelim(e.target.value as DelimiterOption)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-300"
          >
            {DELIMITER_OPTIONS.map((d) => (
              <option key={d.value} value={d.value}>{d.label}</option>
            ))}
          </select>
          {outputDelim === "custom" && (
            <input
              type="text"
              maxLength={10}
              value={outputCustom}
              onChange={(e) => setOutputCustom(e.target.value)}
              placeholder="Enter delimiter…"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-300"
            />
          )}
        </div>
      </div>

      {/* Column preview table */}
      {parsed.length > 0 && colCount > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <label className="text-sm font-semibold text-gray-700">
              Column Preview
              <span className="ml-2 text-xs font-normal text-gray-400">drag to reorder · click × to delete</span>
            </label>
            {hasCustomColOrder && (
              <button
                onClick={handleReset}
                className="text-xs text-gray-400 hover:text-gray-600"
              >
                Reset columns
              </button>
            )}
          </div>

          <div className="border border-gray-200 rounded-lg overflow-auto max-h-72">
            <table className="text-sm border-collapse w-full">
              <thead className="sticky top-0 z-10 bg-gray-50">
                <tr>
                  {effectiveColOrder.map((colIdx, orderIdx) => (
                    <th
                      key={`${colIdx}-${orderIdx}`}
                      draggable
                      onDragStart={() => handleDragStart(orderIdx)}
                      onDragOver={(e) => handleDragOver(e, orderIdx)}
                      onDrop={handleDrop}
                      className="border-b border-gray-200 px-3 py-2 text-left font-semibold text-gray-700 cursor-grab active:cursor-grabbing select-none whitespace-nowrap"
                    >
                      <div className="flex items-center gap-1.5">
                        <span className="text-gray-300 text-xs">⠿</span>
                        <span>Col {colIdx + 1}</span>
                        <button
                          onClick={() => handleDeleteCol(orderIdx)}
                          className="ml-1 text-gray-300 hover:text-red-500 transition-colors leading-none"
                          title="Delete column"
                        >
                          ×
                        </button>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {parsed.slice(0, 50).map((row, ri) => (
                  <tr
                    key={ri}
                    className={ri % 2 === 0 ? "bg-white hover:bg-gray-50" : "bg-gray-50/50 hover:bg-gray-100/50"}
                  >
                    {effectiveColOrder.map((colIdx, orderIdx) => (
                      <td
                        key={orderIdx}
                        className="px-3 py-1.5 border-b border-gray-100 text-gray-700 max-w-[200px] truncate"
                        title={row[colIdx] ?? ""}
                      >
                        {row[colIdx] ?? ""}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {parsed.length > 50 && (
            <p className="text-xs text-gray-400">Showing 50 of {parsed.length} rows in preview.</p>
          )}
        </div>
      )}

      {/* Stats */}
      {parsed.length > 0 && (
        <div className="flex items-center gap-3 flex-wrap text-xs text-gray-500">
          <span className="bg-gray-100 px-2 py-0.5 rounded font-mono">
            {rowCount} row{rowCount !== 1 ? "s" : ""}
          </span>
          <span className="bg-gray-100 px-2 py-0.5 rounded font-mono">
            {effectiveColOrder.length} col{effectiveColOrder.length !== 1 ? "s" : ""}
          </span>
          {colCount !== effectiveColOrder.length && (
            <span className="bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded font-mono">
              {colCount - effectiveColOrder.length} col{colCount - effectiveColOrder.length !== 1 ? "s" : ""} deleted
            </span>
          )}
        </div>
      )}

      {/* Output */}
      {parsed.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <label className="text-sm font-semibold text-gray-700">Output</label>
            <div className="flex items-center gap-2">
              <button
                onClick={handleCopy}
                className="px-3 py-1.5 bg-gray-900 hover:bg-gray-700 text-white text-xs rounded-lg transition-colors"
              >
                {copied ? "Copied!" : "Copy"}
              </button>
              <button
                onClick={handleDownload}
                className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs rounded-lg transition-colors"
              >
                Download
              </button>
            </div>
          </div>
          <textarea
            readOnly
            value={outputText}
            className="w-full h-36 p-4 border border-gray-300 rounded-lg font-mono text-sm bg-gray-50 text-gray-800 resize-y focus:outline-none focus:ring-2 focus:ring-gray-300"
            spellCheck={false}
          />
        </div>
      )}

      {/* Empty state */}
      {!inputText && (
        <div className="border-2 border-dashed border-gray-200 rounded-xl py-16 text-center">
          <p className="text-gray-400 text-sm mb-2">Paste delimited text above to get started</p>
          <p className="text-gray-300 text-xs">Supports CSV, TSV, pipe, semicolon, and custom delimiters</p>
        </div>
      )}
    
      {/* FAQ */}
      <section className="mt-12 space-y-4">
        <h2 className="text-lg font-bold text-gray-800">Frequently Asked Questions</h2>
        <div className="space-y-3">
    <details className="bg-gray-50 rounded-lg p-4 open:bg-gray-100">
      <summary className="font-medium text-gray-700 cursor-pointer select-none">What does this Text to Columns tool do?</summary>
      <p className="mt-2 text-sm text-gray-600">Split text into columns by delimiter and reformat. Just enter your values and get instant results.</p>
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
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify({"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [{"@type": "Question", "name": "What does this Text to Columns tool do?", "acceptedAnswer": {"@type": "Answer", "text": "Split text into columns by delimiter and reformat. Just enter your values and get instant results."}}, {"@type": "Question", "name": "Is this tool free to use?", "acceptedAnswer": {"@type": "Answer", "text": "Yes, completely free. No sign-up or account required."}}, {"@type": "Question", "name": "How accurate are the results?", "acceptedAnswer": {"@type": "Answer", "text": "Results are estimates based on standard formulas. For critical decisions, please consult a qualified professional."}}]})}} />
      
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: `{
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "Text to Columns",
  "description": "Split text into columns by delimiter and reformat",
  "url": "https://tools.loresync.dev/text-columnarizer",
  "applicationCategory": "UtilityApplication",
  "operatingSystem": "All",
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "JPY"
  },
  "inLanguage": "en"
}`
        }}
      />
      </div>
  );
}
