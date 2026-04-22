"use client";

import { useState, useCallback, useMemo } from "react";

interface ParseResult {
  tableName: string;
  columns: string[];
  rows: unknown[][];
}

interface ParseError {
  message: string;
  line?: number;
}

function coerceSqlValue(raw: string): unknown {
  const trimmed = raw.trim();
  // NULL
  if (/^null$/i.test(trimmed)) return null;
  // Boolean
  if (/^true$/i.test(trimmed)) return true;
  if (/^false$/i.test(trimmed)) return false;
  // Quoted string: single-quoted, handle '' and \' escapes
  if (trimmed.startsWith("'") && trimmed.endsWith("'")) {
    return trimmed
      .slice(1, -1)
      .replace(/''/g, "'")
      .replace(/\\'/g, "'");
  }
  // Number
  const n = Number(trimmed);
  if (!isNaN(n) && trimmed !== "") return n;
  // Fallback: strip backtick/double-quote identifiers if any
  if (
    (trimmed.startsWith("`") && trimmed.endsWith("`")) ||
    (trimmed.startsWith('"') && trimmed.endsWith('"'))
  ) {
    return trimmed.slice(1, -1);
  }
  return trimmed;
}

/**
 * Tokenize a parenthesized value list "(v1, v2, ...)" into raw value strings.
 * Handles single-quoted strings with escaped quotes.
 */
function tokenizeValues(inner: string): string[] {
  const tokens: string[] = [];
  let current = "";
  let inString = false;
  let i = 0;
  while (i < inner.length) {
    const ch = inner[i];
    if (inString) {
      if (ch === "'" && inner[i + 1] === "'") {
        current += "''";
        i += 2;
        continue;
      }
      if (ch === "\\" && inner[i + 1] === "'") {
        current += "\\'";
        i += 2;
        continue;
      }
      if (ch === "'") {
        current += ch;
        inString = false;
      } else {
        current += ch;
      }
    } else {
      if (ch === "'") {
        current += ch;
        inString = true;
      } else if (ch === ",") {
        tokens.push(current.trim());
        current = "";
      } else {
        current += ch;
      }
    }
    i++;
  }
  if (current.trim() !== "" || tokens.length > 0) {
    tokens.push(current.trim());
  }
  return tokens;
}

/**
 * Extract the content inside the outermost matching parentheses starting at pos.
 * Returns [content, endIndex] or null if not found.
 */
function extractParens(sql: string, start: number): [string, number] | null {
  let depth = 0;
  let i = start;
  let content = "";
  let inString = false;
  while (i < sql.length) {
    const ch = sql[i];
    if (inString) {
      if (ch === "'" && sql[i + 1] === "'") {
        content += "''";
        i += 2;
        continue;
      }
      if (ch === "\\" && sql[i + 1] === "'") {
        content += "\\'";
        i += 2;
        continue;
      }
      content += ch;
      if (ch === "'") inString = false;
    } else {
      if (ch === "'") {
        inString = true;
        content += ch;
      } else if (ch === "(") {
        if (depth === 0) {
          depth = 1;
        } else {
          depth++;
          content += ch;
        }
      } else if (ch === ")") {
        depth--;
        if (depth === 0) {
          return [content, i];
        }
        content += ch;
      } else if (depth > 0) {
        content += ch;
      }
    }
    i++;
  }
  return null;
}

function stripIdentifierQuotes(name: string): string {
  const t = name.trim();
  if (
    (t.startsWith("`") && t.endsWith("`")) ||
    (t.startsWith('"') && t.endsWith('"')) ||
    (t.startsWith("[") && t.endsWith("]"))
  ) {
    return t.slice(1, -1);
  }
  return t;
}

function parseSqlInserts(sql: string): { results: ParseResult[]; errors: ParseError[] } {
  const results: ParseResult[] = [];
  const errors: ParseError[] = [];

  // Normalize line endings, strip single-line comments
  const normalized = sql
    .replace(/\r\n/g, "\n")
    .replace(/--[^\n]*/g, "")
    .replace(/\/\*[\s\S]*?\*\//g, "");

  // Find all INSERT INTO ... blocks
  const insertRegex = /INSERT\s+INTO\s+/gi;
  let match: RegExpExecArray | null;

  while ((match = insertRegex.exec(normalized)) !== null) {
    const startPos = match.index + match[0].length;

    // Extract table name (possibly quoted)
    const tableMatch = /^([`"[]?[\w$.]+[`"\]]?)/i.exec(normalized.slice(startPos));
    if (!tableMatch) {
      errors.push({ message: "Could not parse table name near position " + startPos });
      continue;
    }
    const tableName = stripIdentifierQuotes(tableMatch[1]);
    let pos = startPos + tableMatch[0].length;

    // Skip optional schema.table dot
    // pos is now after table name

    // Skip whitespace
    while (pos < normalized.length && /\s/.test(normalized[pos])) pos++;

    // Optional column list
    let columns: string[] = [];
    if (normalized[pos] === "(") {
      const colResult = extractParens(normalized, pos);
      if (!colResult) {
        errors.push({ message: `Missing closing ) for column list in INSERT INTO ${tableName}` });
        continue;
      }
      columns = colResult[0].split(",").map((c) => stripIdentifierQuotes(c.trim()));
      pos = colResult[1] + 1;
      while (pos < normalized.length && /\s/.test(normalized[pos])) pos++;
    }

    // Expect VALUES keyword
    const valuesMatch = /^VALUES\s*/i.exec(normalized.slice(pos));
    if (!valuesMatch) {
      errors.push({ message: `Expected VALUES keyword in INSERT INTO ${tableName}` });
      continue;
    }
    pos += valuesMatch[0].length;

    // Extract all value tuples: (v1,v2,...), (v3,v4,...), ...
    const tuples: unknown[][] = [];
    while (pos < normalized.length) {
      while (pos < normalized.length && /\s/.test(normalized[pos])) pos++;
      if (normalized[pos] !== "(") break;
      const tupleResult = extractParens(normalized, pos);
      if (!tupleResult) break;
      const rawValues = tokenizeValues(tupleResult[0]);
      tuples.push(rawValues.map(coerceSqlValue));
      pos = tupleResult[1] + 1;
      while (pos < normalized.length && /\s/.test(normalized[pos])) pos++;
      if (normalized[pos] === ",") {
        pos++;
      } else {
        break;
      }
    }

    if (tuples.length === 0) {
      errors.push({ message: `No value tuples found in INSERT INTO ${tableName}` });
      continue;
    }

    results.push({ tableName, columns, rows: tuples });
  }

  return { results, errors };
}

function buildJsonOutput(results: ParseResult[], pretty: boolean): string {
  const allRows: Record<string, unknown>[] = [];
  for (const { columns, rows } of results) {
    for (const row of rows) {
      if (columns.length === 0) {
        // No column names: output array
        allRows.push(row as unknown as Record<string, unknown>);
      } else {
        const obj: Record<string, unknown> = {};
        columns.forEach((col, i) => {
          obj[col] = row[i] !== undefined ? row[i] : null;
        });
        allRows.push(obj);
      }
    }
  }
  return pretty ? JSON.stringify(allRows, null, 2) : JSON.stringify(allRows);
}

const SAMPLE_SQL = `INSERT INTO users (id, name, email, age, active, score) VALUES
  (1, 'Alice', 'alice@example.com', 30, TRUE, 95.5),
  (2, 'Bob', 'bob@example.com', 25, FALSE, 88.0),
  (3, 'Charlie', 'charlie@example.com', 35, TRUE, 72.3);

INSERT INTO users (id, name, email, age, active, score) VALUES
  (4, 'Diana', 'diana@example.com', 28, TRUE, 91.0);`;

export default function SqlToJson() {
  const [rawText, setRawText] = useState("");
  const [pretty, setPretty] = useState(true);
  const [copied, setCopied] = useState(false);

  const parsed = useMemo(() => {
    if (!rawText.trim()) return null;
    return parseSqlInserts(rawText);
  }, [rawText]);

  const jsonOutput = useMemo(() => {
    if (!parsed || parsed.results.length === 0) return "";
    return buildJsonOutput(parsed.results, pretty);
  }, [parsed, pretty]);

  const stats = useMemo(() => {
    if (!parsed || parsed.results.length === 0) return null;
    const totalRows = parsed.results.reduce((sum, r) => sum + r.rows.length, 0);
    const tables = [...new Set(parsed.results.map((r) => r.tableName))];
    const bytes = new TextEncoder().encode(jsonOutput).length;
    return { totalRows, tables, bytes, stmts: parsed.results.length };
  }, [parsed, jsonOutput]);

  const handleClear = useCallback(() => setRawText(""), []);

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
    a.download = "output.json";
    a.click();
    URL.revokeObjectURL(url);
  }, [jsonOutput]);

  return (
    <div className="space-y-5">
      {/* Input */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-gray-700">SQL Input</p>
          <div className="flex items-center gap-3">
            {!rawText && (
              <button
                onClick={() => setRawText(SAMPLE_SQL)}
                className="text-xs text-blue-600 hover:text-blue-800"
              >
                Load sample SQL
              </button>
            )}
            {rawText && (
              <button
                onClick={handleClear}
                className="text-xs text-gray-400 hover:text-gray-600"
              >
                Clear
              </button>
            )}
          </div>
        </div>
        <textarea
          value={rawText}
          onChange={(e) => setRawText(e.target.value)}
          placeholder="Paste SQL INSERT statements here..."
          className="w-full h-48 p-4 border border-gray-300 rounded-lg font-mono text-sm bg-white text-gray-800 resize-y focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-gray-400"
          spellCheck={false}
        />
      </div>

      {/* Errors */}
      {parsed && parsed.errors.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 space-y-1">
          <p className="text-sm font-semibold text-red-700">Parse Errors</p>
          {parsed.errors.map((err, i) => (
            <p key={i} className="text-sm text-red-600 font-mono">
              {err.message}
            </p>
          ))}
        </div>
      )}

      {/* Options */}
      {parsed && parsed.results.length > 0 && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <label className="flex items-center gap-2 cursor-pointer select-none w-fit">
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
      )}

      {/* Stats */}
      {stats && (
        <div className="flex flex-wrap items-center gap-3">
          <span className="bg-gray-100 px-2 py-0.5 rounded text-xs font-mono text-gray-600">
            {stats.stmts} INSERT{stats.stmts !== 1 ? "s" : ""}
          </span>
          <span className="bg-gray-100 px-2 py-0.5 rounded text-xs font-mono text-gray-600">
            {stats.totalRows} row{stats.totalRows !== 1 ? "s" : ""}
          </span>
          {stats.tables.map((t) => (
            <span
              key={t}
              className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded text-xs font-mono"
            >
              {t}
            </span>
          ))}
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
            Paste SQL INSERT statements above to convert to JSON
          </p>
          <p className="text-gray-300 text-xs">
            Supports multiple INSERTs, quoted strings, numbers, NULL, TRUE/FALSE
          </p>
        </div>
      )}
    </div>
  );
}
