"use client";

import { useState, useCallback, useRef } from "react";

type Alignment = "left" | "center" | "right";

interface TableState {
  headers: string[];
  rows: string[][];
  alignments: Alignment[];
}

function createDefaultTable(): TableState {
  return {
    headers: ["Header 1", "Header 2", "Header 3"],
    rows: [
      ["", "", ""],
      ["", "", ""],
      ["", "", ""],
    ],
    alignments: ["left", "left", "left"],
  };
}

function generateMarkdown(state: TableState): string {
  const { headers, rows, alignments } = state;
  const colCount = headers.length;

  // Calculate column widths
  const widths: number[] = [];
  for (let c = 0; c < colCount; c++) {
    let max = headers[c].length;
    for (const row of rows) {
      if (row[c] && row[c].length > max) max = row[c].length;
    }
    widths[c] = Math.max(max, 3);
  }

  // Header row
  const headerCells = headers.map((h, i) => ` ${h.padEnd(widths[i])} `);
  const headerLine = `|${headerCells.join("|")}|`;

  // Separator row
  const sepCells = alignments.map((a, i) => {
    const w = widths[i];
    if (a === "center") return `:${"-".repeat(w)}:`;
    if (a === "right") return `${"-".repeat(w + 1)}:`;
    return `:${"-".repeat(w + 1)}`;
  });
  const sepLine = `|${sepCells.join("|")}|`;

  // Data rows
  const dataLines = rows.map((row) => {
    const cells = row.map((cell, i) => {
      const val = cell || "";
      const w = widths[i];
      if (alignments[i] === "right") return ` ${val.padStart(w)} `;
      if (alignments[i] === "center") {
        const totalPad = w - val.length;
        const leftPad = Math.floor(totalPad / 2);
        const rightPad = totalPad - leftPad;
        return ` ${" ".repeat(leftPad)}${val}${" ".repeat(rightPad)} `;
      }
      return ` ${val.padEnd(w)} `;
    });
    return `|${cells.join("|")}|`;
  });

  return [headerLine, sepLine, ...dataLines].join("\n");
}

function parseCSV(text: string): { headers: string[]; rows: string[][] } | null {
  const lines = text
    .trim()
    .split(/\r?\n/)
    .filter((l) => l.trim() !== "");
  if (lines.length === 0) return null;

  const parse = (line: string): string[] => {
    const result: string[] = [];
    let current = "";
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (inQuotes) {
        if (ch === '"' && line[i + 1] === '"') {
          current += '"';
          i++;
        } else if (ch === '"') {
          inQuotes = false;
        } else {
          current += ch;
        }
      } else {
        if (ch === '"') {
          inQuotes = true;
        } else if (ch === "," || ch === "\t") {
          result.push(current.trim());
          current = "";
        } else {
          current += ch;
        }
      }
    }
    result.push(current.trim());
    return result;
  };

  const headers = parse(lines[0]);
  const rows = lines.slice(1).map((line) => {
    const cells = parse(line);
    while (cells.length < headers.length) cells.push("");
    return cells.slice(0, headers.length);
  });

  return { headers, rows };
}

const AlignIcon = ({ alignment }: { alignment: Alignment }) => {
  if (alignment === "left") {
    return (
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5">
        <line x1="1" y1="3" x2="13" y2="3" />
        <line x1="1" y1="7" x2="9" y2="7" />
        <line x1="1" y1="11" x2="11" y2="11" />
      </svg>
    );
  }
  if (alignment === "center") {
    return (
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5">
        <line x1="1" y1="3" x2="13" y2="3" />
        <line x1="3" y1="7" x2="11" y2="7" />
        <line x1="2" y1="11" x2="12" y2="11" />
      </svg>
    );
  }
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5">
      <line x1="1" y1="3" x2="13" y2="3" />
      <line x1="5" y1="7" x2="13" y2="7" />
      <line x1="3" y1="11" x2="13" y2="11" />
    </svg>
  );
};

export default function TableEditor() {
  const [table, setTable] = useState<TableState>(createDefaultTable);
  const [copied, setCopied] = useState(false);
  const [showCSVImport, setShowCSVImport] = useState(false);
  const [csvText, setCsvText] = useState("");
  const csvTextareaRef = useRef<HTMLTextAreaElement>(null);

  const markdown = generateMarkdown(table);

  const updateHeader = useCallback((col: number, value: string) => {
    setTable((prev) => {
      const headers = [...prev.headers];
      headers[col] = value;
      return { ...prev, headers };
    });
  }, []);

  const updateCell = useCallback((row: number, col: number, value: string) => {
    setTable((prev) => {
      const rows = prev.rows.map((r) => [...r]);
      rows[row][col] = value;
      return { ...prev, rows };
    });
  }, []);

  const toggleAlignment = useCallback((col: number) => {
    setTable((prev) => {
      const alignments = [...prev.alignments];
      const cycle: Alignment[] = ["left", "center", "right"];
      const idx = cycle.indexOf(alignments[col]);
      alignments[col] = cycle[(idx + 1) % 3];
      return { ...prev, alignments };
    });
  }, []);

  const addRow = useCallback(() => {
    setTable((prev) => ({
      ...prev,
      rows: [...prev.rows, new Array(prev.headers.length).fill("")],
    }));
  }, []);

  const removeRow = useCallback(() => {
    setTable((prev) => {
      if (prev.rows.length <= 1) return prev;
      return { ...prev, rows: prev.rows.slice(0, -1) };
    });
  }, []);

  const addColumn = useCallback(() => {
    setTable((prev) => ({
      headers: [...prev.headers, `Header ${prev.headers.length + 1}`],
      rows: prev.rows.map((r) => [...r, ""]),
      alignments: [...prev.alignments, "left"],
    }));
  }, []);

  const removeColumn = useCallback(() => {
    setTable((prev) => {
      if (prev.headers.length <= 1) return prev;
      return {
        headers: prev.headers.slice(0, -1),
        rows: prev.rows.map((r) => r.slice(0, -1)),
        alignments: prev.alignments.slice(0, -1),
      };
    });
  }, []);

  const clearTable = useCallback(() => {
    setTable(createDefaultTable());
  }, []);

  const copyToClipboard = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(markdown);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
      const textarea = document.createElement("textarea");
      textarea.value = markdown;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [markdown]);

  const importCSV = useCallback(() => {
    const result = parseCSV(csvText);
    if (result && result.headers.length > 0) {
      setTable({
        headers: result.headers,
        rows: result.rows.length > 0 ? result.rows : [new Array(result.headers.length).fill("")],
        alignments: new Array(result.headers.length).fill("left"),
      });
      setShowCSVImport(false);
      setCsvText("");
    }
  }, [csvText]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>, row: number, col: number, isHeader: boolean) => {
      const colCount = table.headers.length;
      const rowCount = table.rows.length;

      if (e.key === "Tab") {
        e.preventDefault();
        const nextCol = e.shiftKey ? col - 1 : col + 1;
        if (nextCol >= 0 && nextCol < colCount) {
          const id = isHeader ? `header-${nextCol}` : `cell-${row}-${nextCol}`;
          document.getElementById(id)?.focus();
        } else if (!e.shiftKey && !isHeader && row < rowCount - 1) {
          document.getElementById(`cell-${row + 1}-0`)?.focus();
        } else if (e.shiftKey && !isHeader && row > 0) {
          document.getElementById(`cell-${row - 1}-${colCount - 1}`)?.focus();
        } else if (!e.shiftKey && isHeader) {
          document.getElementById(`cell-0-0`)?.focus();
        }
      } else if (e.key === "Enter") {
        e.preventDefault();
        if (isHeader) {
          document.getElementById(`cell-0-${col}`)?.focus();
        } else if (row < rowCount - 1) {
          document.getElementById(`cell-${row + 1}-${col}`)?.focus();
        }
      } else if (e.key === "ArrowDown" && !isHeader) {
        if (row < rowCount - 1) {
          e.preventDefault();
          document.getElementById(`cell-${row + 1}-${col}`)?.focus();
        }
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        if (isHeader) return;
        if (row === 0) {
          document.getElementById(`header-${col}`)?.focus();
        } else {
          document.getElementById(`cell-${row - 1}-${col}`)?.focus();
        }
      }
    },
    [table.headers.length, table.rows.length]
  );

  return (
    <div className="w-full max-w-5xl mx-auto">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <button
          onClick={addRow}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-md border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 transition-colors"
          aria-label="Add row"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5">
            <line x1="7" y1="2" x2="7" y2="12" />
            <line x1="2" y1="7" x2="12" y2="7" />
          </svg>
          Row
        </button>
        <button
          onClick={removeRow}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-md border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 transition-colors"
          aria-label="Remove row"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5">
            <line x1="2" y1="7" x2="12" y2="7" />
          </svg>
          Row
        </button>
        <div className="w-px h-6 bg-gray-200 mx-1" />
        <button
          onClick={addColumn}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-md border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 transition-colors"
          aria-label="Add column"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5">
            <line x1="7" y1="2" x2="7" y2="12" />
            <line x1="2" y1="7" x2="12" y2="7" />
          </svg>
          Column
        </button>
        <button
          onClick={removeColumn}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-md border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 transition-colors"
          aria-label="Remove column"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5">
            <line x1="2" y1="7" x2="12" y2="7" />
          </svg>
          Column
        </button>
        <div className="w-px h-6 bg-gray-200 mx-1" />
        <button
          onClick={() => {
            setShowCSVImport(!showCSVImport);
            if (!showCSVImport) {
              setTimeout(() => csvTextareaRef.current?.focus(), 100);
            }
          }}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-md border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 transition-colors"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M7 2v8M4 7l3 3 3-3M2 12h10" />
          </svg>
          Import CSV
        </button>
        <button
          onClick={clearTable}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-md border border-red-200 bg-white text-red-600 hover:bg-red-50 transition-colors"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M3 3l8 8M11 3l-8 8" />
          </svg>
          Clear
        </button>
      </div>

      {/* CSV Import Panel */}
      {showCSVImport && (
        <div className="mb-4 p-4 border border-gray-200 rounded-lg bg-gray-50">
          <label htmlFor="csv-input" className="block text-sm font-medium text-gray-700 mb-2">
            Paste CSV or tab-separated data:
          </label>
          <textarea
            ref={csvTextareaRef}
            id="csv-input"
            value={csvText}
            onChange={(e) => setCsvText(e.target.value)}
            placeholder={"Name, Age, City\nAlice, 30, New York\nBob, 25, London"}
            className="w-full h-28 p-3 text-sm font-mono border border-gray-300 rounded-md resize-y focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          <div className="flex gap-2 mt-2">
            <button
              onClick={importCSV}
              disabled={!csvText.trim()}
              className="px-4 py-1.5 text-sm font-medium rounded-md bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Import
            </button>
            <button
              onClick={() => {
                setShowCSVImport(false);
                setCsvText("");
              }}
              className="px-4 py-1.5 text-sm font-medium rounded-md border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Grid Editor */}
      <div className="overflow-x-auto mb-6 rounded-lg border border-gray-200">
        <table className="border-collapse" role="grid" aria-label="Table editor">
          <thead>
            <tr>
              {table.headers.map((header, col) => (
                <th key={col} className="p-0">
                  <div className="flex flex-col">
                    <input
                      id={`header-${col}`}
                      type="text"
                      value={header}
                      onChange={(e) => updateHeader(col, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(e, -1, col, true)}
                      className="grid-header"
                      aria-label={`Column ${col + 1} header`}
                    />
                    <button
                      onClick={() => toggleAlignment(col)}
                      className="flex items-center justify-center gap-1 py-1 text-xs text-gray-500 hover:text-gray-700 hover:bg-gray-100 border-x border-b border-gray-200 bg-gray-50 transition-colors"
                      aria-label={`Toggle alignment for column ${col + 1}, currently ${table.alignments[col]}`}
                      title={`Align: ${table.alignments[col]}`}
                    >
                      <AlignIcon alignment={table.alignments[col]} />
                      <span className="capitalize">{table.alignments[col]}</span>
                    </button>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {table.rows.map((row, rowIdx) => (
              <tr key={rowIdx}>
                {row.map((cell, col) => (
                  <td key={col} className="p-0">
                    <input
                      id={`cell-${rowIdx}-${col}`}
                      type="text"
                      value={cell}
                      onChange={(e) => updateCell(rowIdx, col, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(e, rowIdx, col, false)}
                      className="grid-cell w-full"
                      aria-label={`Row ${rowIdx + 1}, Column ${col + 1}`}
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Markdown Output */}
      <div className="relative">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
            Markdown Output
          </h2>
          <button
            onClick={copyToClipboard}
            className={`inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-all ${
              copied
                ? "bg-green-600 text-white"
                : "bg-blue-600 text-white hover:bg-blue-700"
            }`}
            aria-label="Copy markdown to clipboard"
          >
            {copied ? (
              <>
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="checkmark-animate"
                >
                  <path d="M3 8l3.5 3.5L13 5" />
                </svg>
                Copied!
              </>
            ) : (
              <>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <rect x="5" y="5" width="8" height="8" rx="1" />
                  <path d="M11 5V3a1 1 0 00-1-1H3a1 1 0 00-1 1v7a1 1 0 001 1h2" />
                </svg>
                Copy to Clipboard
              </>
            )}
          </button>
        </div>
        <div className="relative rounded-lg border border-gray-200 bg-gray-50 p-4 overflow-x-auto">
          <pre className="markdown-output text-gray-800 select-all">{markdown}</pre>
        </div>
      </div>
    </div>
  );
}
