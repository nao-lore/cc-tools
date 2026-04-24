"use client";

import { useState, useCallback } from "react";

type Alignment = "left" | "center" | "right";
type CssFramework = "none" | "bootstrap" | "tailwind";

interface ColumnConfig {
  header: string;
  alignment: Alignment;
}

function buildHtml(
  rows: string[][],
  columns: ColumnConfig[],
  caption: string,
  framework: CssFramework
): string {
  const colCount = columns.length;
  const rowCount = rows.length;

  const tableClass =
    framework === "bootstrap"
      ? ' class="table table-bordered"'
      : framework === "tailwind"
      ? ' class="w-full border-collapse border border-gray-300 text-sm"'
      : "";

  const thClass =
    framework === "bootstrap"
      ? ' class="table-active"'
      : framework === "tailwind"
      ? ' class="border border-gray-300 bg-gray-100 px-3 py-2 font-semibold"'
      : "";

  const tdBaseClass =
    framework === "bootstrap"
      ? ""
      : framework === "tailwind"
      ? "border border-gray-300 px-3 py-2"
      : "";

  const lines: string[] = [];
  lines.push(`<table${tableClass}>`);

  if (caption.trim()) {
    lines.push(`  <caption>${escapeHtml(caption)}</caption>`);
  }

  lines.push("  <thead>");
  lines.push("    <tr>");
  for (let c = 0; c < colCount; c++) {
    const col = columns[c];
    const alignAttr = ` style="text-align:${col.alignment}"`;
    lines.push(`      <th${thClass}${alignAttr}>${escapeHtml(col.header)}</th>`);
  }
  lines.push("    </tr>");
  lines.push("  </thead>");

  lines.push("  <tbody>");
  for (let r = 0; r < rowCount; r++) {
    lines.push("    <tr>");
    for (let c = 0; c < colCount; c++) {
      const col = columns[c];
      const alignAttr = ` style="text-align:${col.alignment}"`;
      const tdClass = tdBaseClass
        ? ` class="${tdBaseClass}"`
        : "";
      const cell = rows[r]?.[c] ?? "";
      lines.push(`      <td${tdClass}${alignAttr}>${escapeHtml(cell)}</td>`);
    }
    lines.push("    </tr>");
  }
  lines.push("  </tbody>");

  lines.push("</table>");

  return lines.join("\n");
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function makeRows(rowCount: number, colCount: number, existing: string[][]): string[][] {
  return Array.from({ length: rowCount }, (_, r) =>
    Array.from({ length: colCount }, (_, c) => existing[r]?.[c] ?? "")
  );
}

function makeColumns(count: number, existing: ColumnConfig[]): ColumnConfig[] {
  return Array.from({ length: count }, (_, i) => ({
    header: existing[i]?.header ?? `Column ${i + 1}`,
    alignment: existing[i]?.alignment ?? "left",
  }));
}

const ALIGNMENT_OPTIONS: { value: Alignment; label: string }[] = [
  { value: "left", label: "L" },
  { value: "center", label: "C" },
  { value: "right", label: "R" },
];

export default function HtmlTableBuilder() {
  const [rowCount, setRowCount] = useState(3);
  const [colCount, setColCount] = useState(3);
  const [rows, setRows] = useState<string[][]>(() => makeRows(3, 3, []));
  const [columns, setColumns] = useState<ColumnConfig[]>(() => makeColumns(3, []));
  const [caption, setCaption] = useState("");
  const [framework, setFramework] = useState<CssFramework>("none");
  const [copied, setCopied] = useState(false);

  const updateCell = useCallback((r: number, c: number, value: string) => {
    setRows((prev) => {
      const next = prev.map((row) => [...row]);
      next[r][c] = value;
      return next;
    });
  }, []);

  const updateColumnHeader = useCallback((c: number, value: string) => {
    setColumns((prev) =>
      prev.map((col, i) => (i === c ? { ...col, header: value } : col))
    );
  }, []);

  const updateColumnAlignment = useCallback((c: number, alignment: Alignment) => {
    setColumns((prev) =>
      prev.map((col, i) => (i === c ? { ...col, alignment } : col))
    );
  }, []);

  const addRow = useCallback(() => {
    setRows((prev) => [...prev, Array.from({ length: colCount }, () => "")]);
    setRowCount((n) => n + 1);
  }, [colCount]);

  const removeRow = useCallback(() => {
    if (rowCount <= 1) return;
    setRows((prev) => prev.slice(0, -1));
    setRowCount((n) => n - 1);
  }, [rowCount]);

  const addCol = useCallback(() => {
    setColumns((prev) => [
      ...prev,
      { header: `Column ${prev.length + 1}`, alignment: "left" },
    ]);
    setRows((prev) => prev.map((row) => [...row, ""]));
    setColCount((n) => n + 1);
  }, []);

  const removeCol = useCallback(() => {
    if (colCount <= 1) return;
    setColumns((prev) => prev.slice(0, -1));
    setRows((prev) => prev.map((row) => row.slice(0, -1)));
    setColCount((n) => n - 1);
  }, [colCount]);

  const html = buildHtml(rows, columns, caption, framework);

  const handleCopy = useCallback(async () => {
    await navigator.clipboard.writeText(html);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [html]);

  return (
    <div className="space-y-6">
      {/* Caption + Framework */}
      <div className="bg-surface rounded-2xl border border-border p-4 space-y-4">
        <div>
          <label className="block text-sm font-medium text-muted mb-1">
            Table Caption (optional)
          </label>
          <input
            type="text"
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder="My Table"
            className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg text-foreground focus:outline-none focus:border-accent transition-colors"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-muted mb-2">
            CSS Framework
          </label>
          <div className="flex gap-2">
            {(["none", "bootstrap", "tailwind"] as CssFramework[]).map((fw) => (
              <button
                key={fw}
                onClick={() => setFramework(fw)}
                className={`px-4 py-2 text-sm rounded-lg border transition-colors capitalize ${
                  framework === fw
                    ? "bg-accent text-white border-accent"
                    : "bg-background border-border text-foreground hover:border-accent"
                }`}
              >
                {fw === "none" ? "Plain HTML" : fw.charAt(0).toUpperCase() + fw.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Grid editor */}
      <div className="bg-surface rounded-2xl border border-border p-4 space-y-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <h3 className="text-sm font-medium text-muted">
            Grid — {rowCount} rows × {colCount} columns
          </h3>
          <div className="flex gap-2 flex-wrap">
            <div className="flex items-center gap-1">
              <span className="text-xs text-muted">Rows:</span>
              <button
                onClick={removeRow}
                disabled={rowCount <= 1}
                className="w-7 h-7 rounded-md bg-background border border-border text-foreground text-sm hover:border-accent disabled:opacity-40 transition-colors"
              >
                −
              </button>
              <button
                onClick={addRow}
                className="w-7 h-7 rounded-md bg-background border border-border text-foreground text-sm hover:border-accent transition-colors"
              >
                +
              </button>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-xs text-muted">Cols:</span>
              <button
                onClick={removeCol}
                disabled={colCount <= 1}
                className="w-7 h-7 rounded-md bg-background border border-border text-foreground text-sm hover:border-accent disabled:opacity-40 transition-colors"
              >
                −
              </button>
              <button
                onClick={addCol}
                className="w-7 h-7 rounded-md bg-background border border-border text-foreground text-sm hover:border-accent transition-colors"
              >
                +
              </button>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            {/* Column config row */}
            <thead>
              <tr>
                {columns.map((col, c) => (
                  <th key={c} className="p-1 min-w-[130px]">
                    <div className="space-y-1">
                      <input
                        type="text"
                        value={col.header}
                        onChange={(e) => updateColumnHeader(c, e.target.value)}
                        placeholder={`Col ${c + 1}`}
                        className="w-full px-2 py-1 text-xs font-semibold bg-background border border-border rounded-lg text-foreground focus:outline-none focus:border-accent transition-colors"
                        aria-label={`Header for column ${c + 1}`}
                      />
                      <div className="flex gap-0.5 justify-center">
                        {ALIGNMENT_OPTIONS.map(({ value, label }) => (
                          <button
                            key={value}
                            onClick={() => updateColumnAlignment(c, value)}
                            className={`flex-1 py-0.5 text-[10px] rounded transition-colors ${
                              col.alignment === value
                                ? "bg-accent text-white"
                                : "bg-background border border-border text-muted hover:border-accent"
                            }`}
                            aria-label={`Align column ${c + 1} ${value}`}
                          >
                            {label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            {/* Data rows */}
            <tbody>
              {rows.map((row, r) => (
                <tr key={r}>
                  {row.map((cell, c) => (
                    <td key={c} className="p-1">
                      <input
                        type="text"
                        value={cell}
                        onChange={(e) => updateCell(r, c, e.target.value)}
                        placeholder={`R${r + 1}C${c + 1}`}
                        className="w-full px-2 py-1.5 text-sm bg-background border border-border rounded-lg text-foreground focus:outline-none focus:border-accent transition-colors"
                        aria-label={`Row ${r + 1}, Column ${c + 1}`}
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Output */}
      <div className="bg-surface rounded-2xl border border-border overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <span className="text-sm font-medium text-muted">Generated HTML</span>
          <button
            onClick={handleCopy}
            className="px-3 py-1.5 text-xs font-medium rounded-md bg-accent text-white hover:bg-accent/80 transition-colors"
          >
            {copied ? "Copied!" : "Copy"}
          </button>
        </div>
        <div className="p-4">
          <pre className="text-xs font-mono text-foreground bg-background rounded-lg border border-border p-4 overflow-x-auto max-h-80 leading-relaxed whitespace-pre">
            {html}
          </pre>
        </div>
      </div>

      {/* Ad placeholder */}
      <div className="w-full h-24 rounded-xl border border-dashed border-border flex items-center justify-center text-muted text-sm">
        Advertisement
      </div>
    
      {/* FAQ */}
      <section className="mt-12 space-y-4">
        <h2 className="text-lg font-bold text-gray-800">Frequently Asked Questions</h2>
        <div className="space-y-3">
    <details className="bg-gray-50 rounded-lg p-4 open:bg-gray-100">
      <summary className="font-medium text-gray-700 cursor-pointer select-none">What does this HTML Table Builder tool do?</summary>
      <p className="mt-2 text-sm text-gray-600">Visual spreadsheet editor that generates HTML table code. Just enter your values and get instant results.</p>
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
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify({"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [{"@type": "Question", "name": "What does this HTML Table Builder tool do?", "acceptedAnswer": {"@type": "Answer", "text": "Visual spreadsheet editor that generates HTML table code. Just enter your values and get instant results."}}, {"@type": "Question", "name": "Is this tool free to use?", "acceptedAnswer": {"@type": "Answer", "text": "Yes, completely free. No sign-up or account required."}}, {"@type": "Question", "name": "How accurate are the results?", "acceptedAnswer": {"@type": "Answer", "text": "Results are estimates based on standard formulas. For critical decisions, please consult a qualified professional."}}]})}} />
      </div>
  );
}
