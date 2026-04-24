"use client";

import { useState, useCallback, useMemo, useRef, useEffect } from "react";

const DISPLAY_CHUNK = 100;
const MAX_ROWS = 5000;

type SortDir = "asc" | "desc" | null;

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

function parseCsv(text: string): { headers: string[]; rows: string[][]; delimiter: string; truncated: boolean } {
  const lines = text.split(/\r?\n/);
  const nonEmpty = lines.filter((l) => l.trim() !== "");
  if (nonEmpty.length === 0) return { headers: [], rows: [], delimiter: ",", truncated: false };

  const delimiter = detectDelimiter(nonEmpty[0]);
  const headers = parseCsvLine(nonEmpty[0], delimiter);
  const dataLines = nonEmpty.slice(1);
  const truncated = dataLines.length > MAX_ROWS;
  const limited = dataLines.slice(0, MAX_ROWS);
  const rows = limited.map((l) => {
    const fields = parseCsvLine(l, delimiter);
    // Pad or trim to match header count
    while (fields.length < headers.length) fields.push("");
    return fields.slice(0, headers.length);
  });

  return { headers, rows, delimiter, truncated };
}

function delimiterLabel(d: string): string {
  if (d === ",") return "Comma";
  if (d === "\t") return "Tab";
  if (d === ";") return "Semicolon";
  if (d === "|") return "Pipe";
  return d;
}

export default function CsvViewer() {
  const [rawText, setRawText] = useState("");
  const [inputMode, setInputMode] = useState<"paste" | "file">("paste");
  const [fileName, setFileName] = useState<string | null>(null);
  const [sortCol, setSortCol] = useState<number | null>(null);
  const [sortDir, setSortDir] = useState<SortDir>(null);
  const [search, setSearch] = useState("");
  const [displayCount, setDisplayCount] = useState(DISPLAY_CHUNK);
  const [colWidths, setColWidths] = useState<number[]>([]);
  const resizingRef = useRef<{ colIdx: number; startX: number; startWidth: number } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const parsed = useMemo(() => {
    if (!rawText.trim()) return null;
    return parseCsv(rawText);
  }, [rawText]);

  // Reset display count and col widths when data changes
  useEffect(() => {
    setDisplayCount(DISPLAY_CHUNK);
    setSortCol(null);
    setSortDir(null);
    setSearch("");
    if (parsed) {
      setColWidths(parsed.headers.map(() => 140));
    }
  }, [rawText]);

  const filteredRows = useMemo(() => {
    if (!parsed) return [];
    let rows = parsed.rows;
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      rows = rows.filter((row) => row.some((cell) => cell.toLowerCase().includes(q)));
    }
    if (sortCol !== null && sortDir !== null) {
      const dir = sortDir === "asc" ? 1 : -1;
      rows = [...rows].sort((a, b) => {
        const av = a[sortCol] ?? "";
        const bv = b[sortCol] ?? "";
        // Try numeric comparison first
        const an = parseFloat(av);
        const bn = parseFloat(bv);
        if (!isNaN(an) && !isNaN(bn)) return (an - bn) * dir;
        return av.localeCompare(bv) * dir;
      });
    }
    return rows;
  }, [parsed, search, sortCol, sortDir]);

  const visibleRows = useMemo(() => filteredRows.slice(0, displayCount), [filteredRows, displayCount]);

  const handleSort = useCallback((colIdx: number) => {
    setSortCol((prev) => {
      if (prev === colIdx) {
        setSortDir((d) => {
          if (d === "asc") return "desc";
          if (d === "desc") { return null; }
          return "asc";
        });
        return colIdx;
      } else {
        setSortDir("asc");
        return colIdx;
      }
    });
  }, []);

  const handleFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      setRawText(text);
      setInputMode("file");
    };
    reader.readAsText(file);
  }, []);

  const handleClear = useCallback(() => {
    setRawText("");
    setFileName(null);
    setInputMode("paste");
    if (fileInputRef.current) fileInputRef.current.value = "";
  }, []);

  // Column resize logic
  const startResize = useCallback((e: React.MouseEvent, colIdx: number) => {
    e.preventDefault();
    resizingRef.current = {
      colIdx,
      startX: e.clientX,
      startWidth: colWidths[colIdx] ?? 140,
    };
    const onMouseMove = (ev: MouseEvent) => {
      if (!resizingRef.current) return;
      const delta = ev.clientX - resizingRef.current.startX;
      const newWidth = Math.max(60, resizingRef.current.startWidth + delta);
      setColWidths((prev) => {
        const next = [...prev];
        next[resizingRef.current!.colIdx] = newWidth;
        return next;
      });
    };
    const onMouseUp = () => {
      resizingRef.current = null;
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
  }, [colWidths]);

  const fileSize = useMemo(() => {
    if (!rawText) return null;
    const bytes = new TextEncoder().encode(rawText).length;
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }, [rawText]);

  const sampleCsv = `name,age,city,score\nAlice,30,New York,95.5\nBob,25,London,88.0\nCharlie,35,Tokyo,72.3\nDiana,28,Paris,91.0\nEvan,22,Sydney,65.8`;

  return (
    <div className="space-y-5">
      {/* Input area */}
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

        {inputMode === "paste" && !parsed && (
          <div className="space-y-2">
            <textarea
              value={rawText}
              onChange={(e) => setRawText(e.target.value)}
              placeholder="Paste CSV data here..."
              className="w-full h-48 p-4 border border-gray-300 rounded-lg font-mono text-sm bg-white text-gray-800 resize-y focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-gray-400"
              spellCheck={false}
            />
            <button
              onClick={() => setRawText(sampleCsv)}
              className="text-xs text-blue-600 hover:text-blue-800"
            >
              Load sample data
            </button>
          </div>
        )}

        {inputMode === "paste" && parsed && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setInputMode("paste")}
              className="text-xs text-gray-400 hover:text-gray-600"
            >
              Edit CSV
            </button>
          </div>
        )}
      </div>

      {/* Stats bar + search */}
      {parsed && parsed.headers.length > 0 && (
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-3 text-sm text-gray-500">
            <span className="bg-gray-100 px-2 py-0.5 rounded text-xs font-mono">
              {filteredRows.length.toLocaleString()} row{filteredRows.length !== 1 ? "s" : ""}
              {search && ` (of ${parsed.rows.length.toLocaleString()})`}
            </span>
            <span className="bg-gray-100 px-2 py-0.5 rounded text-xs font-mono">
              {parsed.headers.length} col{parsed.headers.length !== 1 ? "s" : ""}
            </span>
            {fileSize && (
              <span className="bg-gray-100 px-2 py-0.5 rounded text-xs font-mono">
                {fileSize}
              </span>
            )}
            <span className="bg-gray-100 px-2 py-0.5 rounded text-xs font-mono">
              {delimiterLabel(parsed.delimiter)}
            </span>
          </div>
          <div className="flex-1 min-w-[180px]">
            <input
              type="text"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setDisplayCount(DISPLAY_CHUNK); }}
              placeholder="Search all columns..."
              className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-sm bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-300"
            />
          </div>
        </div>
      )}

      {/* Truncation warning */}
      {parsed?.truncated && (
        <div className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-4 py-2">
          File exceeds {MAX_ROWS.toLocaleString()} rows. Only the first {MAX_ROWS.toLocaleString()} rows are displayed.
        </div>
      )}

      {/* Table */}
      {parsed && parsed.headers.length > 0 && (
        <div className="border border-gray-200 rounded-lg overflow-auto max-h-[600px]">
          <table className="text-sm border-collapse" style={{ tableLayout: "fixed", minWidth: "100%" }}>
            <colgroup>
              {parsed.headers.map((_, i) => (
                <col key={i} style={{ width: colWidths[i] ?? 140 }} />
              ))}
            </colgroup>
            <thead className="sticky top-0 z-10">
              <tr className="bg-gray-50">
                {parsed.headers.map((h, i) => (
                  <th
                    key={i}
                    className="relative border-b border-gray-200 text-left font-semibold text-gray-700 select-none group"
                    style={{ width: colWidths[i] ?? 140 }}
                  >
                    <button
                      onClick={() => handleSort(i)}
                      className="w-full flex items-center gap-1 px-3 py-2 hover:bg-gray-100 transition-colors text-left"
                    >
                      <span className="truncate flex-1">{h}</span>
                      <span className="shrink-0 text-gray-400 w-3">
                        {sortCol === i && sortDir === "asc" && "↑"}
                        {sortCol === i && sortDir === "desc" && "↓"}
                        {(sortCol !== i || sortDir === null) && (
                          <span className="opacity-0 group-hover:opacity-40">↕</span>
                        )}
                      </span>
                    </button>
                    {/* Resize handle */}
                    <div
                      onMouseDown={(e) => startResize(e, i)}
                      className="absolute right-0 top-0 bottom-0 w-2 cursor-col-resize hover:bg-blue-300 opacity-0 hover:opacity-100 transition-opacity"
                    />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {visibleRows.length === 0 ? (
                <tr>
                  <td
                    colSpan={parsed.headers.length}
                    className="px-4 py-8 text-center text-gray-400 text-sm"
                  >
                    No rows match your search.
                  </td>
                </tr>
              ) : (
                visibleRows.map((row, ri) => (
                  <tr
                    key={ri}
                    className={ri % 2 === 0 ? "bg-white hover:bg-gray-50" : "bg-gray-50/50 hover:bg-gray-100/50"}
                  >
                    {row.map((cell, ci) => (
                      <td
                        key={ci}
                        className="px-3 py-2 border-b border-gray-100 text-gray-700 truncate"
                        title={cell}
                        style={{ maxWidth: colWidths[ci] ?? 140 }}
                      >
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Show more */}
      {parsed && filteredRows.length > displayCount && (
        <div className="text-center">
          <button
            onClick={() => setDisplayCount((c) => c + DISPLAY_CHUNK)}
            className="px-5 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm rounded-lg transition-colors"
          >
            Show more ({Math.min(DISPLAY_CHUNK, filteredRows.length - displayCount)} more rows)
          </button>
          <p className="text-xs text-gray-400 mt-1">
            Showing {displayCount.toLocaleString()} of {filteredRows.length.toLocaleString()} rows
          </p>
        </div>
      )}

      {/* Empty state */}
      {!rawText && (
        <div className="border-2 border-dashed border-gray-200 rounded-xl py-16 text-center">
          <p className="text-gray-400 text-sm mb-2">Paste CSV data above or upload a file</p>
          <p className="text-gray-300 text-xs">Supports comma, tab, semicolon, and pipe delimiters</p>
        </div>
      )}
    
      {/* FAQ */}
      <section className="mt-12 space-y-4">
        <h2 className="text-lg font-bold text-gray-800">Frequently Asked Questions</h2>
        <div className="space-y-3">
    <details className="bg-gray-50 rounded-lg p-4 open:bg-gray-100">
      <summary className="font-medium text-gray-700 cursor-pointer select-none">What does this CSV Viewer tool do?</summary>
      <p className="mt-2 text-sm text-gray-600">View and explore CSV files in a sortable table. Just enter your values and get instant results.</p>
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
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify({"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [{"@type": "Question", "name": "What does this CSV Viewer tool do?", "acceptedAnswer": {"@type": "Answer", "text": "View and explore CSV files in a sortable table. Just enter your values and get instant results."}}, {"@type": "Question", "name": "Is this tool free to use?", "acceptedAnswer": {"@type": "Answer", "text": "Yes, completely free. No sign-up or account required."}}, {"@type": "Question", "name": "How accurate are the results?", "acceptedAnswer": {"@type": "Answer", "text": "Results are estimates based on standard formulas. For critical decisions, please consult a qualified professional."}}]})}} />
      
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: `{
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "CSV Viewer",
  "description": "View and explore CSV files in a sortable table",
  "url": "https://tools.loresync.dev/csv-viewer",
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
