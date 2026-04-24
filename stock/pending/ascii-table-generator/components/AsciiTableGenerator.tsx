"use client";

import { useState, useCallback, useRef } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

type BorderStyle = "classic" | "single" | "double" | "markdown" | "simple";
type Alignment = "left" | "center" | "right";

interface TableData {
  headers: string[];
  rows: string[][];
}

// ─── Border style definitions ─────────────────────────────────────────────────

interface BorderChars {
  topLeft: string;
  topRight: string;
  bottomLeft: string;
  bottomRight: string;
  topMid: string;
  bottomMid: string;
  midLeft: string;
  midRight: string;
  midMid: string;
  horizontal: string;
  vertical: string;
  headerLeft: string;
  headerRight: string;
  headerMid: string;
  headerH: string;
}

const BORDERS: Record<BorderStyle, BorderChars> = {
  classic: {
    topLeft: "+", topRight: "+", bottomLeft: "+", bottomRight: "+",
    topMid: "+", bottomMid: "+", midLeft: "+", midRight: "+", midMid: "+",
    horizontal: "-", vertical: "|",
    headerLeft: "+", headerRight: "+", headerMid: "+", headerH: "=",
  },
  single: {
    topLeft: "┌", topRight: "┐", bottomLeft: "└", bottomRight: "┘",
    topMid: "┬", bottomMid: "┴", midLeft: "├", midRight: "┤", midMid: "┼",
    horizontal: "─", vertical: "│",
    headerLeft: "├", headerRight: "┤", headerMid: "┼", headerH: "═",
  },
  double: {
    topLeft: "╔", topRight: "╗", bottomLeft: "╚", bottomRight: "╝",
    topMid: "╦", bottomMid: "╩", midLeft: "╠", midRight: "╣", midMid: "╬",
    horizontal: "═", vertical: "║",
    headerLeft: "╠", headerRight: "╣", headerMid: "╬", headerH: "═",
  },
  markdown: {
    topLeft: "", topRight: "", bottomLeft: "", bottomRight: "",
    topMid: "", bottomMid: "", midLeft: "|", midRight: "|", midMid: "|",
    horizontal: "-", vertical: "|",
    headerLeft: "|", headerRight: "|", headerMid: "|", headerH: "-",
  },
  simple: {
    topLeft: "", topRight: "", bottomLeft: "", bottomRight: "",
    topMid: "", bottomMid: "", midLeft: "", midRight: "", midMid: "",
    horizontal: " ", vertical: "  ",
    headerLeft: "", headerRight: "", headerMid: "", headerH: "-",
  },
};

// ─── CSV parsing ──────────────────────────────────────────────────────────────

function parseCsv(text: string): TableData {
  const lines = text.split("\n").filter((l) => l.trim() !== "");
  if (lines.length === 0) return { headers: [], rows: [] };

  const parseRow = (line: string): string[] => {
    const cells: string[] = [];
    let current = "";
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') {
        if (inQuotes && line[i + 1] === '"') { current += '"'; i++; }
        else { inQuotes = !inQuotes; }
      } else if (ch === "," && !inQuotes) {
        cells.push(current.trim());
        current = "";
      } else {
        current += ch;
      }
    }
    cells.push(current.trim());
    return cells;
  };

  const [headerLine, ...bodyLines] = lines;
  const headers = parseRow(headerLine);
  const rows = bodyLines.map(parseRow);
  return { headers, rows };
}

// ─── Table rendering ──────────────────────────────────────────────────────────

function padCell(text: string, width: number, align: Alignment): string {
  const len = text.length;
  const pad = Math.max(0, width - len);
  if (align === "right") return " ".repeat(pad) + text + " ";
  if (align === "center") {
    const left = Math.floor(pad / 2);
    const right = pad - left;
    return " ".repeat(left) + text + " ".repeat(right) + " ";
  }
  return text + " ".repeat(pad) + " ";
}

function renderTable(
  data: TableData,
  style: BorderStyle,
  alignments: Alignment[]
): string {
  const { headers, rows } = data;
  if (headers.length === 0) return "";

  const colCount = headers.length;
  const allRows = [headers, ...rows];

  // Compute column widths
  const colWidths = Array.from({ length: colCount }, (_, ci) =>
    Math.max(...allRows.map((r) => (r[ci] ?? "").length), 1)
  );

  const b = BORDERS[style];

  const renderSeparator = (
    left: string,
    mid: string,
    right: string,
    h: string
  ): string => {
    if (!left && !mid && !right && !h) return "";
    const parts = colWidths.map((w) => h.repeat(w + 1));
    const line = left + h + parts.join(h + mid + h) + h + right;
    return line;
  };

  const renderRow = (cells: string[], colAlign: Alignment[]): string => {
    const parts = cells.map((cell, ci) =>
      padCell(cell ?? "", colWidths[ci], colAlign[ci] ?? "left")
    );
    return b.vertical + parts.join(b.vertical) + b.vertical;
  };

  const lines: string[] = [];

  if (style === "markdown") {
    // Markdown: no top/bottom borders, just header + separator + rows
    const headerRow = "|" + headers.map((h, ci) => " " + padCell(h, colWidths[ci], alignments[ci] ?? "left")).join("|") + "|";
    lines.push(headerRow);

    const sepCells = colWidths.map((w, ci) => {
      const align = alignments[ci] ?? "left";
      const dashes = "-".repeat(w);
      if (align === "center") return ":" + dashes.slice(0, -1) + ":";
      if (align === "right") return dashes + ":";
      return ":" + dashes;
    });
    lines.push("|" + sepCells.join("|") + "|");

    for (const row of rows) {
      const cells = colWidths.map((_, ci) => " " + padCell(row[ci] ?? "", colWidths[ci], alignments[ci] ?? "left"));
      lines.push("|" + cells.join("|") + "|");
    }
    return lines.join("\n");
  }

  if (style === "simple") {
    // Simple: header, dashes, rows with space separator
    const headerRow = headers.map((h, ci) => padCell(h, colWidths[ci], alignments[ci] ?? "left")).join("  ");
    lines.push(headerRow);
    const sep = colWidths.map((w) => "-".repeat(w + 1)).join("  ");
    lines.push(sep);
    for (const row of rows) {
      lines.push(
        colWidths.map((_, ci) => padCell(row[ci] ?? "", colWidths[ci], alignments[ci] ?? "left")).join("  ")
      );
    }
    return lines.join("\n");
  }

  // Top border
  const top = renderSeparator(b.topLeft, b.topMid, b.topRight, b.horizontal);
  if (top) lines.push(top);

  // Header row
  lines.push(renderRow(headers, alignments));

  // Header separator (uses headerH chars)
  const headerSep = renderSeparator(b.headerLeft, b.headerMid, b.headerRight, b.headerH);
  if (headerSep) lines.push(headerSep);

  // Body rows
  for (let ri = 0; ri < rows.length; ri++) {
    lines.push(renderRow(rows[ri], alignments));
    if (ri < rows.length - 1) {
      const mid = renderSeparator(b.midLeft, b.midMid, b.midRight, b.horizontal);
      if (mid) lines.push(mid);
    }
  }

  // Bottom border
  const bottom = renderSeparator(b.bottomLeft, b.bottomMid, b.bottomRight, b.horizontal);
  if (bottom) lines.push(bottom);

  return lines.join("\n");
}

// ─── Copy button ──────────────────────────────────────────────────────────────

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    if (!text) return;
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }, [text]);

  return (
    <button
      onClick={handleCopy}
      disabled={!text}
      className="text-xs px-3 py-1.5 rounded bg-[var(--muted)] hover:bg-[var(--border)] text-[var(--muted-fg)] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
    >
      {copied ? "Copied!" : "Copy"}
    </button>
  );
}

// ─── Grid editor ──────────────────────────────────────────────────────────────

interface GridEditorProps {
  data: TableData;
  onChange: (data: TableData) => void;
}

function GridEditor({ data, onChange }: GridEditorProps) {
  const { headers, rows } = data;

  const updateHeader = (ci: number, value: string) => {
    const newHeaders = [...headers];
    newHeaders[ci] = value;
    onChange({ headers: newHeaders, rows });
  };

  const updateCell = (ri: number, ci: number, value: string) => {
    const newRows = rows.map((r) => [...r]);
    newRows[ri][ci] = value;
    onChange({ headers, rows: newRows });
  };

  const addRow = () => {
    onChange({ headers, rows: [...rows, Array(headers.length).fill("")] });
  };

  const removeRow = (ri: number) => {
    onChange({ headers, rows: rows.filter((_, i) => i !== ri) });
  };

  const addCol = () => {
    onChange({
      headers: [...headers, `Col ${headers.length + 1}`],
      rows: rows.map((r) => [...r, ""]),
    });
  };

  const removeCol = (ci: number) => {
    onChange({
      headers: headers.filter((_, i) => i !== ci),
      rows: rows.map((r) => r.filter((_, i) => i !== ci)),
    });
  };

  const cellClass =
    "border border-[var(--border)] bg-[var(--background)] px-2 py-1 text-xs text-[var(--foreground)] focus:outline-none focus:ring-1 focus:ring-blue-500 w-full";

  return (
    <div className="overflow-x-auto">
      <table className="border-collapse text-xs">
        <thead>
          <tr>
            <th className="w-6" />
            {headers.map((h, ci) => (
              <th key={ci} className="p-0.5 min-w-[80px]">
                <div className="flex items-center gap-0.5">
                  <input
                    value={h}
                    onChange={(e) => updateHeader(ci, e.target.value)}
                    className={cellClass + " font-semibold"}
                    placeholder={`Col ${ci + 1}`}
                  />
                  {headers.length > 1 && (
                    <button
                      onClick={() => removeCol(ci)}
                      className="shrink-0 w-4 h-4 text-[var(--muted-fg)] hover:text-red-500 transition-colors text-xs leading-none"
                      title="Remove column"
                    >
                      ×
                    </button>
                  )}
                </div>
              </th>
            ))}
            <th className="p-0.5">
              <button
                onClick={addCol}
                className="text-xs px-1.5 py-0.5 rounded bg-[var(--muted)] hover:bg-[var(--border)] text-[var(--muted-fg)] transition-colors"
                title="Add column"
              >
                + Col
              </button>
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, ri) => (
            <tr key={ri}>
              <td className="pr-1 text-[var(--muted-fg)] text-right text-xs select-none w-6">
                {ri + 1}
              </td>
              {headers.map((_, ci) => (
                <td key={ci} className="p-0.5">
                  <input
                    value={row[ci] ?? ""}
                    onChange={(e) => updateCell(ri, ci, e.target.value)}
                    className={cellClass}
                    placeholder="—"
                  />
                </td>
              ))}
              <td className="p-0.5">
                {rows.length > 1 && (
                  <button
                    onClick={() => removeRow(ri)}
                    className="text-xs text-[var(--muted-fg)] hover:text-red-500 transition-colors px-1"
                    title="Remove row"
                  >
                    ×
                  </button>
                )}
              </td>
            </tr>
          ))}
          <tr>
            <td />
            <td colSpan={headers.length + 1} className="p-0.5">
              <button
                onClick={addRow}
                className="text-xs px-2 py-0.5 rounded bg-[var(--muted)] hover:bg-[var(--border)] text-[var(--muted-fg)] transition-colors"
              >
                + Row
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

const SAMPLE_CSV = `Name,Age,City,Score
Alice,30,New York,95
Bob,25,London,88
Charlie,35,Tokyo,72
Diana,28,Paris,91`;

const DEFAULT_DATA: TableData = {
  headers: ["Name", "Age", "City", "Score"],
  rows: [
    ["Alice", "30", "New York", "95"],
    ["Bob", "25", "London", "88"],
    ["Charlie", "35", "Tokyo", "72"],
    ["Diana", "28", "Paris", "91"],
  ],
};

export default function AsciiTableGenerator() {
  const [inputMode, setInputMode] = useState<"csv" | "grid">("csv");
  const [csvText, setCsvText] = useState(SAMPLE_CSV);
  const [gridData, setGridData] = useState<TableData>(DEFAULT_DATA);
  const [borderStyle, setBorderStyle] = useState<BorderStyle>("single");
  const [alignments, setAlignments] = useState<Alignment[]>(["left", "left", "left", "left"]);

  const data: TableData =
    inputMode === "csv" ? parseCsv(csvText) : gridData;

  // Sync alignments length when columns change
  const colCount = data.headers.length;
  const effectiveAlignments: Alignment[] = Array.from(
    { length: colCount },
    (_, i) => alignments[i] ?? "left"
  );

  const updateAlignment = (ci: number, align: Alignment) => {
    const next = [...effectiveAlignments];
    next[ci] = align;
    setAlignments(next);
  };

  const output = data.headers.length > 0
    ? renderTable(data, borderStyle, effectiveAlignments)
    : "";

  const handleCsvChange = (text: string) => {
    setCsvText(text);
  };

  const handleGridChange = (d: TableData) => {
    setGridData(d);
    // Sync alignments array length
    setAlignments((prev) => {
      const next = [...prev];
      while (next.length < d.headers.length) next.push("left");
      return next.slice(0, d.headers.length);
    });
  };

  const borderOptions: { value: BorderStyle; label: string; preview: string }[] = [
    { value: "classic", label: "Classic", preview: "+---+" },
    { value: "single", label: "Single Line", preview: "┌───┐" },
    { value: "double", label: "Double Line", preview: "╔═══╗" },
    { value: "markdown", label: "Markdown", preview: "| - |" },
    { value: "simple", label: "Simple", preview: "  —  " },
  ];

  return (
    <div className="space-y-6">
      {/* Mode toggle */}
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-[var(--foreground)]">Input mode:</span>
        <div className="flex rounded-lg border border-[var(--border)] overflow-hidden">
          {(["csv", "grid"] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => setInputMode(mode)}
              className={`px-4 py-1.5 text-sm transition-colors ${
                inputMode === mode
                  ? "bg-blue-600 text-white"
                  : "bg-[var(--background)] text-[var(--muted-fg)] hover:bg-[var(--muted)]"
              }`}
            >
              {mode === "csv" ? "CSV / Paste" : "Grid Editor"}
            </button>
          ))}
        </div>
      </div>

      {/* Input area */}
      {inputMode === "csv" ? (
        <div className="space-y-2">
          <label className="block text-sm font-medium text-[var(--foreground)]">
            CSV Input
          </label>
          <textarea
            value={csvText}
            onChange={(e) => handleCsvChange(e.target.value)}
            rows={8}
            className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--foreground)] placeholder:text-[var(--muted-fg)] focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y font-mono"
            placeholder={"Name,Age,City\nAlice,30,New York\nBob,25,London"}
            spellCheck={false}
          />
          <p className="text-xs text-[var(--muted-fg)]">
            First row is treated as the header. Quoted fields supported.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          <label className="block text-sm font-medium text-[var(--foreground)]">
            Grid Editor
          </label>
          <div className="rounded-lg border border-[var(--border)] p-3 bg-[var(--background)]">
            <GridEditor data={gridData} onChange={handleGridChange} />
          </div>
        </div>
      )}

      {/* Options row */}
      <div className="flex flex-wrap gap-6 items-start">
        {/* Border style */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-[var(--foreground)]">
            Border Style
          </label>
          <div className="flex flex-wrap gap-2">
            {borderOptions.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setBorderStyle(opt.value)}
                className={`px-3 py-1.5 rounded-lg border text-xs font-mono transition-colors ${
                  borderStyle === opt.value
                    ? "border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300"
                    : "border-[var(--border)] bg-[var(--background)] text-[var(--muted-fg)] hover:bg-[var(--muted)]"
                }`}
              >
                <span className="block text-center">{opt.preview}</span>
                <span className="block text-center mt-0.5 font-sans">{opt.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Column alignment */}
        {data.headers.length > 0 && (
          <div className="space-y-2">
            <label className="block text-sm font-medium text-[var(--foreground)]">
              Column Alignment
            </label>
            <div className="flex flex-wrap gap-2">
              {data.headers.map((h, ci) => (
                <div key={ci} className="flex flex-col items-center gap-1">
                  <span className="text-xs text-[var(--muted-fg)] truncate max-w-[80px]" title={h}>
                    {h || `Col ${ci + 1}`}
                  </span>
                  <div className="flex rounded border border-[var(--border)] overflow-hidden">
                    {(["left", "center", "right"] as Alignment[]).map((align) => (
                      <button
                        key={align}
                        onClick={() => updateAlignment(ci, align)}
                        title={align}
                        className={`px-1.5 py-0.5 text-xs transition-colors ${
                          effectiveAlignments[ci] === align
                            ? "bg-blue-600 text-white"
                            : "bg-[var(--background)] text-[var(--muted-fg)] hover:bg-[var(--muted)]"
                        }`}
                      >
                        {align === "left" ? "←" : align === "center" ? "↔" : "→"}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Output */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="block text-sm font-medium text-[var(--foreground)]">
            ASCII Table Output
          </label>
          <CopyButton text={output} />
        </div>
        <pre className="w-full rounded-lg border border-[var(--border)] bg-[var(--muted)] px-4 py-3 text-sm font-mono text-[var(--foreground)] overflow-x-auto whitespace-pre leading-relaxed min-h-[120px]">
          {output || (
            <span className="text-[var(--muted-fg)] italic text-xs not-italic">
              Table preview will appear here...
            </span>
          )}
        </pre>
      </div>
    
      {/* FAQ */}
      <section className="mt-12 space-y-4">
        <h2 className="text-lg font-bold text-gray-800">Frequently Asked Questions</h2>
        <div className="space-y-3">
    <details className="bg-gray-50 rounded-lg p-4 open:bg-gray-100">
      <summary className="font-medium text-gray-700 cursor-pointer select-none">What does this ASCII Table Generator tool do?</summary>
      <p className="mt-2 text-sm text-gray-600">Convert CSV or tabular data into ASCII art tables. Just enter your values and get instant results.</p>
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
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify({"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [{"@type": "Question", "name": "What does this ASCII Table Generator tool do?", "acceptedAnswer": {"@type": "Answer", "text": "Convert CSV or tabular data into ASCII art tables. Just enter your values and get instant results."}}, {"@type": "Question", "name": "Is this tool free to use?", "acceptedAnswer": {"@type": "Answer", "text": "Yes, completely free. No sign-up or account required."}}, {"@type": "Question", "name": "How accurate are the results?", "acceptedAnswer": {"@type": "Answer", "text": "Results are estimates based on standard formulas. For critical decisions, please consult a qualified professional."}}]})}} />
      
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: `{
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "ASCII Table Generator",
  "description": "Convert CSV or tabular data into ASCII art tables",
  "url": "https://tools.loresync.dev/ascii-table-generator",
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
