"use client";

import { useState, useCallback, useMemo } from "react";

type Mode = "json-to-csv" | "csv-to-json";
type Delimiter = "," | "\t" | ";";

function flattenObject(
  obj: Record<string, unknown>,
  prefix = ""
): Record<string, string> {
  const result: Record<string, string> = {};
  for (const key in obj) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    const value = obj[key];
    if (value && typeof value === "object" && !Array.isArray(value)) {
      Object.assign(
        result,
        flattenObject(value as Record<string, unknown>, fullKey)
      );
    } else if (Array.isArray(value)) {
      result[fullKey] = JSON.stringify(value);
    } else {
      result[fullKey] = value == null ? "" : String(value);
    }
  }
  return result;
}

function escapeField(field: string, delimiter: string, quoteAll: boolean): string {
  if (quoteAll) return `"${field.replace(/"/g, '""')}"`;
  if (
    field.includes(delimiter) ||
    field.includes('"') ||
    field.includes("\n")
  ) {
    return `"${field.replace(/"/g, '""')}"`;
  }
  return field;
}

function jsonToCsvConvert(
  jsonStr: string,
  delimiter: Delimiter,
  includeHeaders: boolean,
  quoteAll: boolean
): { csv: string; headers: string[]; rows: string[][] } {
  const parsed = JSON.parse(jsonStr);
  let items: Record<string, unknown>[];

  if (Array.isArray(parsed)) {
    if (parsed.length === 0) throw new Error("Empty array");
    items = parsed;
  } else if (typeof parsed === "object" && parsed !== null) {
    items = [parsed];
  } else {
    throw new Error("JSON must be an array of objects or a single object");
  }

  const flattened = items.map((item) =>
    flattenObject(item as Record<string, unknown>)
  );
  const headerSet = new Set<string>();
  for (const row of flattened) {
    for (const key of Object.keys(row)) {
      headerSet.add(key);
    }
  }
  const headers = Array.from(headerSet);

  const rows = flattened.map((row) =>
    headers.map((h) => row[h] ?? "")
  );

  const lines: string[] = [];
  if (includeHeaders) {
    lines.push(
      headers.map((h) => escapeField(h, delimiter, quoteAll)).join(delimiter)
    );
  }
  for (const row of rows) {
    lines.push(
      row.map((cell) => escapeField(cell, delimiter, quoteAll)).join(delimiter)
    );
  }

  return { csv: lines.join("\n"), headers, rows };
}

function csvToJsonConvert(csvStr: string, delimiter: Delimiter): string {
  const lines = csvStr.split("\n").filter((l) => l.trim() !== "");
  if (lines.length < 2) throw new Error("CSV must have a header row and at least one data row");

  function parseLine(line: string, delim: string): string[] {
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

  const headers = parseLine(lines[0], delimiter);
  const result = [];
  for (let i = 1; i < lines.length; i++) {
    const values = parseLine(lines[i], delimiter);
    const obj: Record<string, string> = {};
    for (let j = 0; j < headers.length; j++) {
      obj[headers[j]] = values[j] ?? "";
    }
    result.push(obj);
  }
  return JSON.stringify(result, null, 2);
}

export default function JsonToCsv() {
  const [mode, setMode] = useState<Mode>("json-to-csv");
  const [input, setInput] = useState(
    `[\n  { "name": "Alice", "age": 30, "city": "New York" },\n  { "name": "Bob", "age": 25, "city": "London" },\n  { "name": "Charlie", "age": 35, "city": "Tokyo" }\n]`
  );
  const [delimiter, setDelimiter] = useState<Delimiter>(",");
  const [includeHeaders, setIncludeHeaders] = useState(true);
  const [quoteAll, setQuoteAll] = useState(false);
  const [copied, setCopied] = useState(false);

  const result = useMemo(() => {
    try {
      if (mode === "json-to-csv") {
        const { csv, headers, rows } = jsonToCsvConvert(
          input,
          delimiter,
          includeHeaders,
          quoteAll
        );
        return { output: csv, headers, rows, error: null };
      } else {
        const json = csvToJsonConvert(input, delimiter);
        return { output: json, headers: null, rows: null, error: null };
      }
    } catch (e) {
      return {
        output: "",
        headers: null,
        rows: null,
        error: e instanceof Error ? e.message : "Invalid input",
      };
    }
  }, [input, delimiter, includeHeaders, quoteAll, mode]);

  const handleCopy = useCallback(() => {
    if (!result.output) return;
    navigator.clipboard.writeText(result.output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [result.output]);

  const handleDownload = useCallback(() => {
    if (!result.output) return;
    const ext = mode === "json-to-csv" ? "csv" : "json";
    const mimeType =
      mode === "json-to-csv" ? "text/csv;charset=utf-8;" : "application/json";
    const blob = new Blob([result.output], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `data.${ext}`;
    a.click();
    URL.revokeObjectURL(url);
  }, [result.output, mode]);

  const handleModeSwitch = useCallback(() => {
    if (result.output) {
      setInput(result.output);
    }
    setMode((m) => (m === "json-to-csv" ? "csv-to-json" : "json-to-csv"));
  }, [result.output]);

  const delimiterLabel = delimiter === "," ? "Comma" : delimiter === "\t" ? "Tab" : "Semicolon";

  return (
    <div className="space-y-6">
      {/* Mode Toggle */}
      <div className="flex items-center justify-center gap-3">
        <button
          onClick={() => {
            setMode("json-to-csv");
            setInput(
              `[\n  { "name": "Alice", "age": 30, "city": "New York" },\n  { "name": "Bob", "age": 25, "city": "London" }\n]`
            );
          }}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            mode === "json-to-csv"
              ? "bg-gray-900 text-white"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          JSON → CSV
        </button>
        <button
          onClick={handleModeSwitch}
          className="p-2 rounded-lg bg-gray-100 text-gray-500 hover:bg-gray-200 transition-colors"
          title="Swap input/output"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M7 16V4m0 0L3 8m4-4l4 4M17 8v12m0 0l4-4m-4 4l-4-4" />
          </svg>
        </button>
        <button
          onClick={() => {
            setMode("csv-to-json");
            setInput(`name,age,city\nAlice,30,New York\nBob,25,London`);
          }}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            mode === "csv-to-json"
              ? "bg-gray-900 text-white"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          CSV → JSON
        </button>
      </div>

      {/* Options */}
      <div className="flex flex-wrap items-center justify-center gap-4 text-sm">
        <label className="flex items-center gap-2 text-gray-700">
          <span className="font-medium">Delimiter:</span>
          <select
            value={delimiter}
            onChange={(e) => setDelimiter(e.target.value as Delimiter)}
            className="border border-gray-300 rounded-md px-2 py-1 bg-white text-gray-800"
          >
            <option value=",">Comma (,)</option>
            <option value="&#9;">Tab</option>
            <option value=";">Semicolon (;)</option>
          </select>
        </label>
        {mode === "json-to-csv" && (
          <>
            <label className="flex items-center gap-2 text-gray-700 cursor-pointer">
              <input
                type="checkbox"
                checked={includeHeaders}
                onChange={(e) => setIncludeHeaders(e.target.checked)}
                className="rounded border-gray-300 accent-gray-900"
              />
              <span>Include headers</span>
            </label>
            <label className="flex items-center gap-2 text-gray-700 cursor-pointer">
              <input
                type="checkbox"
                checked={quoteAll}
                onChange={(e) => setQuoteAll(e.target.checked)}
                className="rounded border-gray-300 accent-gray-900"
              />
              <span>Quote all fields</span>
            </label>
          </>
        )}
      </div>

      {/* Input / Output */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Input */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-sm font-semibold text-gray-700">
              {mode === "json-to-csv" ? "JSON Input" : "CSV Input"}
            </h2>
            <button
              onClick={() => setInput("")}
              className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
            >
              Clear
            </button>
          </div>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={
              mode === "json-to-csv"
                ? 'Paste JSON here... e.g. [{"name":"Alice","age":30}]'
                : "Paste CSV here... e.g. name,age\\nAlice,30"
            }
            className="w-full h-64 p-4 border border-gray-300 rounded-lg font-mono text-sm bg-white text-gray-800 resize-y focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-gray-400"
            spellCheck={false}
          />
        </div>

        {/* Output */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-sm font-semibold text-gray-700">
              {mode === "json-to-csv" ? "CSV Output" : "JSON Output"}
            </h2>
            <div className="flex gap-2">
              <button
                onClick={handleCopy}
                disabled={!result.output}
                className="text-xs px-3 py-1 rounded-md bg-gray-100 text-gray-600 hover:bg-gray-200 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                {copied ? "Copied!" : "Copy"}
              </button>
              <button
                onClick={handleDownload}
                disabled={!result.output}
                className="text-xs px-3 py-1 rounded-md bg-gray-900 text-white hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Download .{mode === "json-to-csv" ? "csv" : "json"}
              </button>
            </div>
          </div>
          {result.error ? (
            <div className="w-full h-64 p-4 border border-red-200 rounded-lg bg-red-50 text-red-600 text-sm flex items-start">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="mr-2 mt-0.5 shrink-0"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="15" y1="9" x2="9" y2="15" />
                <line x1="9" y1="9" x2="15" y2="15" />
              </svg>
              {result.error}
            </div>
          ) : (
            <textarea
              value={result.output}
              readOnly
              className="w-full h-64 p-4 border border-gray-300 rounded-lg font-mono text-sm bg-gray-50 text-gray-800 resize-y focus:outline-none"
            />
          )}
        </div>
      </div>

      {/* Table Preview (JSON to CSV mode only) */}
      {mode === "json-to-csv" && result.headers && result.rows && (
        <div>
          <h2 className="text-sm font-semibold text-gray-700 mb-2">
            Table Preview
          </h2>
          <div className="border border-gray-200 rounded-lg overflow-auto max-h-80">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50">
                  {result.headers.map((h, i) => (
                    <th
                      key={i}
                      className="px-4 py-2 text-left font-semibold text-gray-700 border-b border-gray-200 whitespace-nowrap"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {result.rows.map((row, ri) => (
                  <tr
                    key={ri}
                    className={ri % 2 === 0 ? "bg-white" : "bg-gray-50/50"}
                  >
                    {row.map((cell, ci) => (
                      <td
                        key={ci}
                        className="px-4 py-2 text-gray-700 border-b border-gray-100 whitespace-nowrap"
                      >
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-gray-400 mt-1">
            {result.rows.length} row{result.rows.length !== 1 ? "s" : ""} ·{" "}
            {result.headers.length} column{result.headers.length !== 1 ? "s" : ""} · Delimiter: {delimiterLabel}
          </p>
        </div>
      )}
    </div>
  );
}
