"use client";

import { useState, useCallback, useMemo, useRef } from "react";

type OutputMode = "array-of-objects" | "array-of-arrays" | "keyed";

function detectDelimiter(line: string): string {
  const candidates = [",", "\t", ";", "|"];
  let best = ",";
  let bestCount = 0;
  for (const d of candidates) {
    const count = line.split(d).length - 1;
    if (count > bestCount) {
      bestCount = count;
      best = d;
    }
  }
  return best;
}

function parseCsvLine(line: string, delim: string): string[] {
  const fields: string[] = [];
  let current = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (inQuotes) {
      if (ch === '"') {
        if (i + 1 < line.length && line[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        current += ch;
      }
    } else {
      if (ch === '"') {
        inQuotes = true;
      } else if (ch === delim) {
        fields.push(current);
        current = "";
      } else {
        current += ch;
      }
    }
  }
  fields.push(current);
  return fields;
}

function parseCsv(text: string): {
  headers: string[];
  rows: string[][];
  delimiter: string;
} {
  const lines = text.split(/\r?\n/).filter((l) => l.trim() !== "");
  if (lines.length === 0) return { headers: [], rows: [], delimiter: "," };
  const delimiter = detectDelimiter(lines[0]);
  const headers = parseCsvLine(lines[0], delimiter);
  const rows = lines.slice(1).map((l) => {
    const fields = parseCsvLine(l, delimiter);
    while (fields.length < headers.length) fields.push("");
    return fields.slice(0, headers.length);
  });
  return { headers, rows, delimiter };
}

function delimiterLabel(d: string): string {
  if (d === ",") return "Comma";
  if (d === "\t") return "Tab";
  if (d === ";") return "Semicolon";
  if (d === "|") return "Pipe";
  return d;
}

function coerceValue(val: string): string | number | null {
  if (val === "") return null;
  const n = Number(val);
  if (!isNaN(n) && val.trim() !== "") return n;
  return val;
}

function buildJson(
  headers: string[],
  rows: string[][],
  mode: OutputMode,
  keyCol: number
): unknown {
  if (mode === "array-of-arrays") {
    return [headers, ...rows.map((r) => r.map(coerceValue))];
  }
  if (mode === "keyed") {
    const result: Record<string, unknown[]> = {};
    for (const h of headers) result[h] = [];
    for (const row of rows) {
      headers.forEach((h, i) => result[h].push(coerceValue(row[i])));
    }
    return result;
  }
  // default: array-of-objects
  return rows.map((row) => {
    const obj: Record<string, unknown> = {};
    headers.forEach((h, i) => {
      obj[h] = coerceValue(row[i]);
    });
    return obj;
  });
}

const SAMPLE_CSV = `name,age,city,score\nAlice,30,New York,95.5\nBob,25,London,88.0\nCharlie,35,Tokyo,72.3\nDiana,28,Paris,91.0`;

export default function CsvToJson() {
  const [rawText, setRawText] = useState("");
  const [inputMode, setInputMode] = useState<"paste" | "file">("paste");
  const [fileName, setFileName] = useState<string | null>(null);
  const [outputMode, setOutputMode] = useState<OutputMode>("array-of-objects");
  const [keyCol, setKeyCol] = useState(0);
  const [pretty, setPretty] = useState(true);
  const [copied, setCopied] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const parsed = useMemo(() => {
    if (!rawText.trim()) return null;
    return parseCsv(rawText);
  }, [rawText]);

  const jsonOutput = useMemo(() => {
    if (!parsed || parsed.headers.length === 0) return "";
    const data = buildJson(parsed.headers, parsed.rows, outputMode, keyCol);
    return pretty ? JSON.stringify(data, null, 2) : JSON.stringify(data);
  }, [parsed, outputMode, keyCol, pretty]);

  const handleFileUpload = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      setFileName(file.name);
      const reader = new FileReader();
      reader.onload = (ev) => {
        setRawText(ev.target?.result as string);
        setInputMode("file");
      };
      reader.readAsText(file);
    },
    []
  );

  const handleClear = useCallback(() => {
    setRawText("");
    setFileName(null);
    setInputMode("paste");
    if (fileInputRef.current) fileInputRef.current.value = "";
  }, []);

  const handleCopy = useCallback(() => {
    if (!jsonOutput) return;
    navigator.clipboard.writeText(jsonOutput).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [jsonOutput]);

  const handleDownload = useCallback(() => {
    if (!jsonOutput) return;
    const blob = new Blob([jsonOutput], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName ? fileName.replace(/\.[^.]+$/, ".json") : "output.json";
    a.click();
    URL.revokeObjectURL(url);
  }, [jsonOutput, fileName]);

  const stats = useMemo(() => {
    if (!parsed) return null;
    return {
      rows: parsed.rows.length,
      cols: parsed.headers.length,
      delimiter: delimiterLabel(parsed.delimiter),
      bytes: new TextEncoder().encode(jsonOutput).length,
    };
  }, [parsed, jsonOutput]);

  const outputModes: { value: OutputMode; label: string; desc: string }[] = [
    { value: "array-of-objects", label: "Array of Objects", desc: "[{col: val, ...}]" },
    { value: "array-of-arrays", label: "Array of Arrays", desc: "[[headers], [vals], ...]" },
    { value: "keyed", label: "Keyed by Column", desc: "{col: [vals], ...}" },
  ];

  return (
    <div className="space-y-5">
      {/* Input controls */}
      <div className="space-y-3">
        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={() => setInputMode("paste")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              inputMode === "paste"
                ? "bg-gray-900 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            Paste CSV
          </button>
          <button
            onClick={() => fileInputRef.current?.click()}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              inputMode === "file"
                ? "bg-gray-900 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            Upload File
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,.tsv,.txt"
            onChange={handleFileUpload}
            className="hidden"
          />
          {fileName && (
            <span className="text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
              {fileName}
            </span>
          )}
          {rawText && (
            <button
              onClick={handleClear}
              className="text-sm text-gray-400 hover:text-gray-600 ml-auto"
            >
              Clear
            </button>
          )}
        </div>

        {(inputMode === "paste" || !parsed) && (
          <div className="space-y-2">
            <textarea
              value={rawText}
              onChange={(e) => setRawText(e.target.value)}
              placeholder="Paste CSV data here..."
              className="w-full h-40 p-4 border border-gray-300 rounded-lg font-mono text-sm bg-white text-gray-800 resize-y focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-gray-400"
              spellCheck={false}
            />
            {!rawText && (
              <button
                onClick={() => setRawText(SAMPLE_CSV)}
                className="text-xs text-blue-600 hover:text-blue-800"
              >
                Load sample data
              </button>
            )}
          </div>
        )}
      </div>

      {/* Options */}
      {parsed && parsed.headers.length > 0 && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-4">
          <div className="space-y-2">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Output Mode
            </p>
            <div className="flex flex-wrap gap-2">
              {outputModes.map((m) => (
                <button
                  key={m.value}
                  onClick={() => setOutputMode(m.value)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors border ${
                    outputMode === m.value
                      ? "bg-gray-900 text-white border-gray-900"
                      : "bg-white text-gray-600 border-gray-200 hover:border-gray-400"
                  }`}
                >
                  <span>{m.label}</span>
                  <span
                    className={`ml-2 text-xs font-mono ${
                      outputMode === m.value ? "text-gray-300" : "text-gray-400"
                    }`}
                  >
                    {m.desc}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-6">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <div
                onClick={() => setPretty((p) => !p)}
                className={`w-9 h-5 rounded-full transition-colors ${
                  pretty ? "bg-gray-800" : "bg-gray-300"
                } relative`}
              >
                <div
                  className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${
                    pretty ? "translate-x-4" : "translate-x-0.5"
                  }`}
                />
              </div>
              <span className="text-sm text-gray-700">
                {pretty ? "Formatted" : "Minified"}
              </span>
            </label>
          </div>
        </div>
      )}

      {/* Stats */}
      {stats && (
        <div className="flex flex-wrap items-center gap-3">
          <span className="bg-gray-100 px-2 py-0.5 rounded text-xs font-mono text-gray-600">
            {stats.rows.toLocaleString()} row{stats.rows !== 1 ? "s" : ""}
          </span>
          <span className="bg-gray-100 px-2 py-0.5 rounded text-xs font-mono text-gray-600">
            {stats.cols} col{stats.cols !== 1 ? "s" : ""}
          </span>
          <span className="bg-gray-100 px-2 py-0.5 rounded text-xs font-mono text-gray-600">
            {stats.delimiter}
          </span>
          <span className="bg-gray-100 px-2 py-0.5 rounded text-xs font-mono text-gray-600">
            {stats.bytes < 1024
              ? `${stats.bytes} B`
              : `${(stats.bytes / 1024).toFixed(1)} KB`}{" "}
            JSON
          </span>
        </div>
      )}

      {/* Output */}
      {jsonOutput && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-gray-700">JSON Output</p>
            <div className="flex items-center gap-2">
              <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm rounded-lg transition-colors"
              >
                {copied ? (
                  <>
                    <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-green-600">Copied!</span>
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    Copy
                  </>
                )}
              </button>
              <button
                onClick={handleDownload}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-900 hover:bg-gray-700 text-white text-sm rounded-lg transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Download .json
              </button>
            </div>
          </div>
          <textarea
            readOnly
            value={jsonOutput}
            className="w-full h-72 p-4 border border-gray-300 rounded-lg font-mono text-sm bg-white text-gray-800 resize-y focus:outline-none focus:ring-2 focus:ring-gray-300"
            spellCheck={false}
          />
        </div>
      )}

      {/* Empty state */}
      {!rawText && (
        <div className="border-2 border-dashed border-gray-200 rounded-xl py-16 text-center">
          <p className="text-gray-400 text-sm mb-2">
            Paste CSV data above or upload a file to convert to JSON
          </p>
          <p className="text-gray-300 text-xs">
            Supports comma, tab, semicolon, and pipe delimiters
          </p>
        </div>
      )}
    
      {/* FAQ */}
      <section className="mt-12 space-y-4">
        <h2 className="text-lg font-bold text-gray-800">Frequently Asked Questions</h2>
        <div className="space-y-3">
    <details className="bg-gray-50 rounded-lg p-4 open:bg-gray-100">
      <summary className="font-medium text-gray-700 cursor-pointer select-none">What does this CSV to JSON Converter tool do?</summary>
      <p className="mt-2 text-sm text-gray-600">Convert CSV data to JSON array with column header mapping. Just enter your values and get instant results.</p>
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
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify({"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [{"@type": "Question", "name": "What does this CSV to JSON Converter tool do?", "acceptedAnswer": {"@type": "Answer", "text": "Convert CSV data to JSON array with column header mapping. Just enter your values and get instant results."}}, {"@type": "Question", "name": "Is this tool free to use?", "acceptedAnswer": {"@type": "Answer", "text": "Yes, completely free. No sign-up or account required."}}, {"@type": "Question", "name": "How accurate are the results?", "acceptedAnswer": {"@type": "Answer", "text": "Results are estimates based on standard formulas. For critical decisions, please consult a qualified professional."}}]})}} />
      </div>
  );
}
