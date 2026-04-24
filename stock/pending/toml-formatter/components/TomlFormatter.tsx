"use client";

import { useState, useCallback } from "react";

// ============================================================
// TOML Parser — handles:
//   [sections], [[array of tables]], key = value,
//   strings (basic, literal, multiline), numbers, booleans,
//   arrays, inline tables, dotted keys, comments
// ============================================================

type TomlValue =
  | string
  | number
  | boolean
  | null
  | TomlValue[]
  | Record<string, TomlValue>;

interface ParseError {
  line: number;
  message: string;
}

interface ParseResult {
  data: Record<string, TomlValue> | null;
  errors: ParseError[];
}

function parseToml(input: string): ParseResult {
  const errors: ParseError[] = [];
  const root: Record<string, TomlValue> = {};
  const lines = input.split("\n");

  // Track current table context
  let currentTable: Record<string, TomlValue> = root;
  let currentArrayTableKey: string[] | null = null;

  function setNestedKey(
    obj: Record<string, TomlValue>,
    keys: string[],
    value: TomlValue
  ): void {
    let cur: Record<string, TomlValue> = obj;
    for (let i = 0; i < keys.length - 1; i++) {
      const k = keys[i];
      if (!(k in cur)) {
        cur[k] = {};
      }
      const next = cur[k];
      if (Array.isArray(next)) {
        // Navigate into last element of array of tables
        const last = next[next.length - 1] as Record<string, TomlValue>;
        cur = last;
      } else if (typeof next === "object" && next !== null) {
        cur = next as Record<string, TomlValue>;
      } else {
        // Overwrite with object (error in real TOML but be lenient)
        cur[k] = {};
        cur = cur[k] as Record<string, TomlValue>;
      }
    }
    cur[keys[keys.length - 1]] = value;
  }

  function getNestedTable(
    obj: Record<string, TomlValue>,
    keys: string[]
  ): Record<string, TomlValue> {
    let cur: Record<string, TomlValue> = obj;
    for (const k of keys) {
      if (!(k in cur)) {
        cur[k] = {};
      }
      const next = cur[k];
      if (Array.isArray(next)) {
        const last = next[next.length - 1];
        if (typeof last === "object" && last !== null && !Array.isArray(last)) {
          cur = last as Record<string, TomlValue>;
        } else {
          cur = {};
        }
      } else if (typeof next === "object" && next !== null) {
        cur = next as Record<string, TomlValue>;
      } else {
        cur[k] = {};
        cur = cur[k] as Record<string, TomlValue>;
      }
    }
    return cur;
  }

  function parseString(s: string, lineNum: number): { value: string; rest: string } | null {
    if (s.startsWith('"""')) {
      const end = s.indexOf('"""', 3);
      if (end === -1) {
        errors.push({ line: lineNum, message: "Unterminated triple-quoted string" });
        return null;
      }
      return {
        value: s.slice(3, end).replace(/^\\?\n/, ""),
        rest: s.slice(end + 3),
      };
    }
    if (s.startsWith("'''")) {
      const end = s.indexOf("'''", 3);
      if (end === -1) {
        errors.push({ line: lineNum, message: "Unterminated triple single-quoted string" });
        return null;
      }
      return {
        value: s.slice(3, end).replace(/^\\?\n/, ""),
        rest: s.slice(end + 3),
      };
    }
    if (s.startsWith('"')) {
      let i = 1;
      let result = "";
      while (i < s.length) {
        if (s[i] === "\\" && i + 1 < s.length) {
          const esc = s[i + 1];
          const escMap: Record<string, string> = {
            n: "\n", t: "\t", r: "\r", '"': '"', "\\": "\\", b: "\b", f: "\f",
          };
          result += escMap[esc] ?? esc;
          i += 2;
        } else if (s[i] === '"') {
          return { value: result, rest: s.slice(i + 1) };
        } else {
          result += s[i];
          i++;
        }
      }
      errors.push({ line: lineNum, message: "Unterminated string" });
      return null;
    }
    if (s.startsWith("'")) {
      const end = s.indexOf("'", 1);
      if (end === -1) {
        errors.push({ line: lineNum, message: "Unterminated literal string" });
        return null;
      }
      return { value: s.slice(1, end), rest: s.slice(end + 1) };
    }
    return null;
  }

  function parseScalar(s: string, lineNum: number): { value: TomlValue; rest: string } | null {
    s = s.trimStart();
    if (!s) return null;

    // String
    if (s.startsWith('"') || s.startsWith("'")) {
      const r = parseString(s, lineNum);
      if (!r) return null;
      return { value: r.value, rest: r.rest };
    }

    // Inline array
    if (s.startsWith("[")) {
      return parseInlineArray(s, lineNum);
    }

    // Inline table
    if (s.startsWith("{")) {
      return parseInlineTable(s, lineNum);
    }

    // Boolean
    if (s.startsWith("true") && /^true[\s,\]\}#]?/.test(s)) {
      return { value: true, rest: s.slice(4) };
    }
    if (s.startsWith("false") && /^false[\s,\]\}#]?/.test(s)) {
      return { value: false, rest: s.slice(5) };
    }

    // Number (float, int, hex, octal, binary, special)
    const numMatch = s.match(/^([+-]?(?:0x[\dA-Fa-f_]+|0o[0-7_]+|0b[01_]+|nan|inf|[+-]?inf|[\d_]+(?:\.[\d_]+)?(?:[eE][+-]?[\d_]+)?))/);
    if (numMatch) {
      const raw = numMatch[1].replace(/_/g, "");
      let num: number;
      if (raw === "nan" || raw === "+nan" || raw === "-nan") num = NaN;
      else if (raw === "inf" || raw === "+inf") num = Infinity;
      else if (raw === "-inf") num = -Infinity;
      else if (raw.startsWith("0x")) num = parseInt(raw, 16);
      else if (raw.startsWith("0o")) num = parseInt(raw.slice(2), 8);
      else if (raw.startsWith("0b")) num = parseInt(raw.slice(2), 2);
      else num = Number(raw);
      return { value: num, rest: s.slice(numMatch[1].length) };
    }

    // Datetime (ISO 8601 — treat as string)
    const dtMatch = s.match(/^(\d{4}-\d{2}-\d{2}(?:[T ]\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})?)?)/);
    if (dtMatch) {
      return { value: dtMatch[1], rest: s.slice(dtMatch[1].length) };
    }

    return null;
  }

  function parseInlineArray(s: string, lineNum: number): { value: TomlValue[]; rest: string } | null {
    if (!s.startsWith("[")) return null;
    s = s.slice(1);
    const arr: TomlValue[] = [];
    while (true) {
      s = s.trimStart();
      if (s.startsWith("]")) return { value: arr, rest: s.slice(1) };
      if (!s) {
        errors.push({ line: lineNum, message: "Unterminated inline array" });
        return null;
      }
      // Skip comments in inline arrays (unusual but handle gracefully)
      const r = parseScalar(s, lineNum);
      if (!r) {
        errors.push({ line: lineNum, message: `Invalid value in array: ${s.slice(0, 20)}` });
        return null;
      }
      arr.push(r.value);
      s = r.rest.trimStart();
      if (s.startsWith(",")) s = s.slice(1);
    }
  }

  function parseInlineTable(s: string, lineNum: number): { value: Record<string, TomlValue>; rest: string } | null {
    if (!s.startsWith("{")) return null;
    s = s.slice(1);
    const obj: Record<string, TomlValue> = {};
    while (true) {
      s = s.trimStart();
      if (s.startsWith("}")) return { value: obj, rest: s.slice(1) };
      if (!s) {
        errors.push({ line: lineNum, message: "Unterminated inline table" });
        return null;
      }
      // Parse key
      const keyResult = parseKey(s, lineNum);
      if (!keyResult) {
        errors.push({ line: lineNum, message: `Invalid key in inline table: ${s.slice(0, 20)}` });
        return null;
      }
      s = keyResult.rest.trimStart();
      if (!s.startsWith("=")) {
        errors.push({ line: lineNum, message: "Expected '=' in inline table" });
        return null;
      }
      s = s.slice(1).trimStart();
      const valResult = parseScalar(s, lineNum);
      if (!valResult) {
        errors.push({ line: lineNum, message: `Invalid value in inline table: ${s.slice(0, 20)}` });
        return null;
      }
      setNestedKey(obj, keyResult.keys, valResult.value);
      s = valResult.rest.trimStart();
      if (s.startsWith(",")) s = s.slice(1);
    }
  }

  function parseKey(s: string, lineNum: number): { keys: string[]; rest: string } | null {
    s = s.trimStart();
    const keys: string[] = [];

    while (true) {
      let key: string;
      let rest: string;

      if (s.startsWith('"') || s.startsWith("'")) {
        const r = parseString(s, lineNum);
        if (!r) return null;
        key = r.value;
        rest = r.rest;
      } else {
        const bareMatch = s.match(/^([\w-]+)/);
        if (!bareMatch) return null;
        key = bareMatch[1];
        rest = s.slice(bareMatch[1].length);
      }

      keys.push(key);
      rest = rest.trimStart();

      if (rest.startsWith(".")) {
        s = rest.slice(1).trimStart();
      } else {
        return { keys, rest };
      }
    }
  }

  // Process lines
  let i = 0;
  while (i < lines.length) {
    const lineNum = i + 1;
    let line = lines[i].trimEnd();
    i++;

    // Strip inline comment
    const commentIdx = findCommentStart(line);
    if (commentIdx !== -1) {
      line = line.slice(0, commentIdx);
    }
    line = line.trim();

    if (!line) continue;

    // Array of tables [[key]]
    if (line.startsWith("[[")) {
      const end = line.indexOf("]]");
      if (end === -1) {
        errors.push({ line: lineNum, message: "Unterminated [[array of tables]] header" });
        continue;
      }
      const keyStr = line.slice(2, end).trim();
      const keyResult = parseKey(keyStr, lineNum);
      if (!keyResult) {
        errors.push({ line: lineNum, message: `Invalid array of tables key: ${keyStr}` });
        continue;
      }
      currentArrayTableKey = keyResult.keys;
      // Navigate to parent
      const parentKeys = keyResult.keys.slice(0, -1);
      const lastKey = keyResult.keys[keyResult.keys.length - 1];
      const parent = parentKeys.length > 0 ? getNestedTable(root, parentKeys) : root;
      if (!(lastKey in parent)) {
        parent[lastKey] = [];
      }
      const arr = parent[lastKey] as TomlValue[];
      const newTable: Record<string, TomlValue> = {};
      arr.push(newTable);
      currentTable = newTable;
      continue;
    }

    // Table header [key]
    if (line.startsWith("[")) {
      const end = line.indexOf("]");
      if (end === -1) {
        errors.push({ line: lineNum, message: "Unterminated [table] header" });
        continue;
      }
      const keyStr = line.slice(1, end).trim();
      const keyResult = parseKey(keyStr, lineNum);
      if (!keyResult) {
        errors.push({ line: lineNum, message: `Invalid table key: ${keyStr}` });
        continue;
      }
      currentArrayTableKey = null;
      currentTable = getNestedTable(root, keyResult.keys);
      continue;
    }

    // Key = value
    const eqIdx = findEquals(line);
    if (eqIdx === -1) {
      errors.push({ line: lineNum, message: `Expected '=' in: ${line.slice(0, 40)}` });
      continue;
    }

    const keyStr = line.slice(0, eqIdx).trim();
    let valStr = line.slice(eqIdx + 1).trim();

    const keyResult = parseKey(keyStr, lineNum);
    if (!keyResult) {
      errors.push({ line: lineNum, message: `Invalid key: ${keyStr}` });
      continue;
    }

    // Handle multiline basic strings
    if (valStr.startsWith('"""') && !valStr.slice(3).includes('"""')) {
      let multiline = valStr.slice(3);
      while (i < lines.length && !multiline.includes('"""')) {
        multiline += "\n" + lines[i];
        i++;
      }
      const endIdx = multiline.indexOf('"""');
      if (endIdx === -1) {
        errors.push({ line: lineNum, message: "Unterminated multiline string" });
        continue;
      }
      const value = multiline.slice(0, endIdx).replace(/^\n/, "");
      setNestedKey(currentTable, keyResult.keys, value);
      continue;
    }

    // Handle multiline literal strings
    if (valStr.startsWith("'''") && !valStr.slice(3).includes("'''")) {
      let multiline = valStr.slice(3);
      while (i < lines.length && !multiline.includes("'''")) {
        multiline += "\n" + lines[i];
        i++;
      }
      const endIdx = multiline.indexOf("'''");
      if (endIdx === -1) {
        errors.push({ line: lineNum, message: "Unterminated multiline literal string" });
        continue;
      }
      const value = multiline.slice(0, endIdx).replace(/^\n/, "");
      setNestedKey(currentTable, keyResult.keys, value);
      continue;
    }

    const valResult = parseScalar(valStr, lineNum);
    if (!valResult) {
      errors.push({ line: lineNum, message: `Invalid value: ${valStr.slice(0, 40)}` });
      continue;
    }

    setNestedKey(currentTable, keyResult.keys, valResult.value);
  }

  return { data: errors.length === 0 || Object.keys(root).length > 0 ? root : null, errors };
}

// Find the position of '#' that starts a comment (not inside strings)
function findCommentStart(line: string): number {
  let inDouble = false;
  let inSingle = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (c === '"' && !inSingle) inDouble = !inDouble;
    else if (c === "'" && !inDouble) inSingle = !inSingle;
    else if (c === "#" && !inDouble && !inSingle) return i;
  }
  return -1;
}

// Find '=' not inside strings
function findEquals(line: string): number {
  let inDouble = false;
  let inSingle = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (c === '"' && !inSingle) inDouble = !inDouble;
    else if (c === "'" && !inDouble) inSingle = !inSingle;
    else if (c === "=" && !inDouble && !inSingle) return i;
  }
  return -1;
}

// ============================================================
// TOML Formatter (pretty-print from parsed object)
// ============================================================

function formatToml(obj: Record<string, TomlValue>, prefix = ""): string {
  const lines: string[] = [];
  const simpleEntries: [string, TomlValue][] = [];
  const tableEntries: [string, Record<string, TomlValue>][] = [];
  const arrayTableEntries: [string, TomlValue[]][] = [];

  for (const [k, v] of Object.entries(obj)) {
    if (Array.isArray(v) && v.length > 0 && typeof v[0] === "object" && v[0] !== null && !Array.isArray(v[0])) {
      arrayTableEntries.push([k, v as TomlValue[]]);
    } else if (typeof v === "object" && v !== null && !Array.isArray(v)) {
      tableEntries.push([k, v as Record<string, TomlValue>]);
    } else {
      simpleEntries.push([k, v]);
    }
  }

  // Simple key-value pairs first
  for (const [k, v] of simpleEntries) {
    lines.push(`${k} = ${tomlValue(v)}`);
  }

  // Sub-tables
  for (const [k, v] of tableEntries) {
    const fullKey = prefix ? `${prefix}.${k}` : k;
    if (lines.length > 0) lines.push("");
    lines.push(`[${fullKey}]`);
    lines.push(formatToml(v, fullKey));
  }

  // Array of tables
  for (const [k, arr] of arrayTableEntries) {
    const fullKey = prefix ? `${prefix}.${k}` : k;
    for (const item of arr) {
      if (lines.length > 0) lines.push("");
      lines.push(`[[${fullKey}]]`);
      if (typeof item === "object" && item !== null && !Array.isArray(item)) {
        lines.push(formatToml(item as Record<string, TomlValue>, fullKey));
      }
    }
  }

  return lines.filter((l, i, arr) => !(l === "" && arr[i - 1] === "")).join("\n");
}

function tomlValue(v: TomlValue): string {
  if (v === null) return '""';
  if (typeof v === "boolean") return v ? "true" : "false";
  if (typeof v === "number") {
    if (isNaN(v)) return "nan";
    if (!isFinite(v)) return v > 0 ? "inf" : "-inf";
    return String(v);
  }
  if (typeof v === "string") {
    // Use basic string with escaping
    const escaped = v
      .replace(/\\/g, "\\\\")
      .replace(/"/g, '\\"')
      .replace(/\n/g, "\\n")
      .replace(/\t/g, "\\t")
      .replace(/\r/g, "\\r");
    return `"${escaped}"`;
  }
  if (Array.isArray(v)) {
    if (v.length === 0) return "[]";
    const items = v.map(tomlValue);
    const oneLine = `[${items.join(", ")}]`;
    if (oneLine.length <= 80) return oneLine;
    return `[\n  ${items.join(",\n  ")},\n]`;
  }
  if (typeof v === "object" && v !== null) {
    const pairs = Object.entries(v as Record<string, TomlValue>).map(
      ([k, val]) => `${k} = ${tomlValue(val)}`
    );
    return `{${pairs.join(", ")}}`;
  }
  return String(v);
}

// Minify TOML: strip comments and extra whitespace
function minifyToml(input: string): string {
  return input
    .split("\n")
    .map((line) => {
      const commentIdx = findCommentStart(line);
      const stripped = commentIdx !== -1 ? line.slice(0, commentIdx) : line;
      return stripped.trim();
    })
    .filter((l) => l !== "")
    .join("\n");
}

// ============================================================
// Tree view renderer
// ============================================================

function TreeNode({ keyName, value, depth }: { keyName: string; value: TomlValue; depth: number }) {
  const [open, setOpen] = useState(true);
  const indent = depth * 16;

  if (Array.isArray(value)) {
    return (
      <div>
        <button
          onClick={() => setOpen(!open)}
          className="flex items-center gap-1 text-left hover:bg-gray-100 w-full px-1 rounded"
          style={{ paddingLeft: indent }}
        >
          <span className="text-gray-400 text-xs w-3">{open ? "▾" : "▸"}</span>
          <span className="text-purple-700 font-medium text-sm">{keyName}</span>
          <span className="text-gray-400 text-xs ml-1">Array({value.length})</span>
        </button>
        {open && value.map((item, idx) => (
          <TreeNode key={idx} keyName={`[${idx}]`} value={item} depth={depth + 1} />
        ))}
      </div>
    );
  }

  if (typeof value === "object" && value !== null) {
    const entries = Object.entries(value as Record<string, TomlValue>);
    return (
      <div>
        <button
          onClick={() => setOpen(!open)}
          className="flex items-center gap-1 text-left hover:bg-gray-100 w-full px-1 rounded"
          style={{ paddingLeft: indent }}
        >
          <span className="text-gray-400 text-xs w-3">{open ? "▾" : "▸"}</span>
          <span className="text-blue-700 font-medium text-sm">{keyName}</span>
          <span className="text-gray-400 text-xs ml-1">{`{${entries.length}}`}</span>
        </button>
        {open && entries.map(([k, v]) => (
          <TreeNode key={k} keyName={k} value={v} depth={depth + 1} />
        ))}
      </div>
    );
  }

  const typeColor =
    typeof value === "string"
      ? "text-green-700"
      : typeof value === "number"
      ? "text-orange-600"
      : typeof value === "boolean"
      ? "text-red-600"
      : "text-gray-400";

  const displayVal =
    typeof value === "string"
      ? `"${value.length > 60 ? value.slice(0, 60) + "…" : value}"`
      : String(value);

  return (
    <div className="flex items-baseline gap-2 px-1 py-0.5 hover:bg-gray-50 rounded" style={{ paddingLeft: indent + 16 }}>
      <span className="text-gray-700 text-sm font-medium shrink-0">{keyName}</span>
      <span className="text-gray-300 text-xs">=</span>
      <span className={`text-sm font-mono ${typeColor} break-all`}>{displayVal}</span>
      <span className="text-gray-300 text-xs ml-auto shrink-0">{typeof value}</span>
    </div>
  );
}

// ============================================================
// Component
// ============================================================

type OutputTab = "formatted" | "json" | "tree";

const SAMPLE_TOML = `# Example TOML configuration
title = "TOML Formatter Example"
version = 1

[owner]
name = "Alice"
active = true

[database]
host = "localhost"
port = 5432
credentials = {user = "admin", pass = "secret"}

[[servers]]
name = "alpha"
ip = "10.0.0.1"
role = "primary"

[[servers]]
name = "beta"
ip = "10.0.0.2"
role = "replica"

[settings]
tags = ["toml", "config", "formatter"]
max_connections = 100
timeout = 30.5
`;

export default function TomlFormatter() {
  const [input, setInput] = useState<string>(SAMPLE_TOML);
  const [activeTab, setActiveTab] = useState<OutputTab>("formatted");
  const [copied, setCopied] = useState(false);

  const result = useCallback((): ParseResult => {
    if (!input.trim()) return { data: {}, errors: [] };
    return parseToml(input);
  }, [input])();

  const formattedToml = result.data ? formatToml(result.data) : "";
  const jsonOutput = result.data
    ? JSON.stringify(result.data, (_, v) => {
        if (typeof v === "number" && (isNaN(v) || !isFinite(v))) return String(v);
        return v;
      }, 2)
    : "";

  const outputText =
    activeTab === "formatted"
      ? formattedToml
      : activeTab === "json"
      ? jsonOutput
      : "";

  const handleFormat = () => {
    if (!result.data) return;
    setInput(formattedToml);
  };

  const handleMinify = () => {
    setInput(minifyToml(input));
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(outputText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback silently
    }
  };

  const handleClear = () => {
    setInput("");
  };

  const tabs: { id: OutputTab; label: string }[] = [
    { id: "formatted", label: "Formatted TOML" },
    { id: "json", label: "JSON" },
    { id: "tree", label: "Tree" },
  ];

  const hasErrors = result.errors.length > 0;

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={handleFormat}
          disabled={hasErrors || !result.data}
          className="px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
        >
          Format
        </button>
        <button
          onClick={handleMinify}
          className="px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors cursor-pointer"
        >
          Minify
        </button>
        <div className="ml-auto">
          <button
            onClick={handleClear}
            className="px-3 py-1.5 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
          >
            Clear
          </button>
        </div>
      </div>

      {/* Main layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Input */}
        <div className="space-y-2">
          <h2 className="text-sm font-semibold text-gray-700">Input TOML</h2>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="w-full h-96 p-4 font-mono text-sm bg-gray-50 border border-gray-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-gray-300 transition-all"
            placeholder="Paste your TOML here..."
            spellCheck={false}
          />
        </div>

        {/* Output */}
        <div className="space-y-2">
          {/* Tab bar */}
          <div className="flex items-center gap-0 border-b border-gray-200">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors cursor-pointer -mb-px ${
                  activeTab === tab.id
                    ? "border-gray-900 text-gray-900"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                {tab.label}
              </button>
            ))}
            {activeTab !== "tree" && (
              <button
                onClick={handleCopy}
                className="ml-auto px-3 py-1.5 text-xs text-gray-600 border border-gray-200 rounded hover:bg-gray-50 transition-colors cursor-pointer mb-1"
              >
                {copied ? "Copied!" : "Copy"}
              </button>
            )}
          </div>

          {/* Output content */}
          {activeTab === "tree" ? (
            <div className="h-96 overflow-y-auto border border-gray-200 rounded-lg bg-white p-3">
              {result.data && Object.keys(result.data).length > 0 ? (
                Object.entries(result.data).map(([k, v]) => (
                  <TreeNode key={k} keyName={k} value={v} depth={0} />
                ))
              ) : (
                <p className="text-sm text-gray-400 text-center mt-8">
                  {hasErrors ? "Fix errors to see tree" : "No data to display"}
                </p>
              )}
            </div>
          ) : (
            <textarea
              readOnly
              value={outputText}
              className="w-full h-96 p-4 font-mono text-sm bg-gray-50 border border-gray-200 rounded-lg resize-none focus:outline-none"
              placeholder={activeTab === "formatted" ? "Formatted TOML will appear here..." : "JSON will appear here..."}
              spellCheck={false}
            />
          )}
        </div>
      </div>

      {/* Validation errors */}
      {hasErrors && (
        <div className="border border-red-200 bg-red-50 rounded-lg p-4 space-y-1">
          <p className="text-sm font-semibold text-red-700 mb-2">
            {result.errors.length} validation error{result.errors.length !== 1 ? "s" : ""}
          </p>
          {result.errors.map((err, idx) => (
            <div key={idx} className="flex items-start gap-3 text-sm text-red-700 font-mono">
              <span className="shrink-0 bg-red-100 text-red-600 px-1.5 py-0.5 rounded text-xs">
                Line {err.line}
              </span>
              <span>{err.message}</span>
            </div>
          ))}
        </div>
      )}

      {/* Valid badge */}
      {!hasErrors && input.trim() && (
        <div className="flex items-center gap-2 text-sm text-green-700">
          <span className="w-2 h-2 bg-green-500 rounded-full inline-block"></span>
          Valid TOML
        </div>
      )}
    
      {/* FAQ */}
      <section className="mt-12 space-y-4">
        <h2 className="text-lg font-bold text-gray-800">Frequently Asked Questions</h2>
        <div className="space-y-3">
    <details className="bg-gray-50 rounded-lg p-4 open:bg-gray-100">
      <summary className="font-medium text-gray-700 cursor-pointer select-none">What does this TOML Formatter tool do?</summary>
      <p className="mt-2 text-sm text-gray-600">Format, validate, and convert TOML files. Just enter your values and get instant results.</p>
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
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify({"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [{"@type": "Question", "name": "What does this TOML Formatter tool do?", "acceptedAnswer": {"@type": "Answer", "text": "Format, validate, and convert TOML files. Just enter your values and get instant results."}}, {"@type": "Question", "name": "Is this tool free to use?", "acceptedAnswer": {"@type": "Answer", "text": "Yes, completely free. No sign-up or account required."}}, {"@type": "Question", "name": "How accurate are the results?", "acceptedAnswer": {"@type": "Answer", "text": "Results are estimates based on standard formulas. For critical decisions, please consult a qualified professional."}}]})}} />
      
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: `{
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "TOML Formatter",
  "description": "Format, validate, and convert TOML files",
  "url": "https://tools.loresync.dev/toml-formatter",
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
