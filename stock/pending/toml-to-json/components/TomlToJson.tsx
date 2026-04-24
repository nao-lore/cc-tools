"use client";

import { useState, useCallback } from "react";

// ============================================================
// TOML Parser — supports:
//   [sections], [[array-of-tables]], key = value,
//   basic strings, literal strings, multiline strings,
//   integers, floats, booleans, arrays, inline tables,
//   dotted keys, comments
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

  let currentTable: Record<string, TomlValue> = root;

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
        const last = next[next.length - 1] as Record<string, TomlValue>;
        cur = last;
      } else if (typeof next === "object" && next !== null) {
        cur = next as Record<string, TomlValue>;
      } else {
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

  // Parse a value starting at position in the full multi-line content.
  // Returns { value, endIndex } or null on error.
  function parseValue(
    content: string,
    pos: number,
    lineNum: number
  ): { value: TomlValue; end: number } | null {
    // Skip leading space on same line
    while (pos < content.length && content[pos] === " ") pos++;

    const ch = content[pos];

    // Multiline basic string
    if (content.startsWith('"""', pos)) {
      const start = pos + 3;
      const endIdx = content.indexOf('"""', start);
      if (endIdx === -1) {
        errors.push({ line: lineNum, message: "Unterminated triple-quoted basic string" });
        return null;
      }
      let str = content.slice(start, endIdx);
      // Trim leading newline
      if (str.startsWith("\n")) str = str.slice(1);
      // Handle line-ending backslash (trim whitespace)
      str = str.replace(/\\\n\s*/g, "");
      // Unescape sequences
      str = str.replace(/\\n/g, "\n").replace(/\\t/g, "\t").replace(/\\"/g, '"').replace(/\\\\/g, "\\");
      return { value: str, end: endIdx + 3 };
    }

    // Multiline literal string
    if (content.startsWith("'''", pos)) {
      const start = pos + 3;
      const endIdx = content.indexOf("'''", start);
      if (endIdx === -1) {
        errors.push({ line: lineNum, message: "Unterminated triple-quoted literal string" });
        return null;
      }
      let str = content.slice(start, endIdx);
      if (str.startsWith("\n")) str = str.slice(1);
      return { value: str, end: endIdx + 3 };
    }

    // Basic string
    if (ch === '"') {
      let str = "";
      let i = pos + 1;
      while (i < content.length && content[i] !== '"') {
        if (content[i] === "\\") {
          i++;
          const esc = content[i];
          if (esc === "n") str += "\n";
          else if (esc === "t") str += "\t";
          else if (esc === "r") str += "\r";
          else if (esc === '"') str += '"';
          else if (esc === "\\") str += "\\";
          else str += esc;
        } else {
          str += content[i];
        }
        i++;
      }
      if (i >= content.length) {
        errors.push({ line: lineNum, message: "Unterminated basic string" });
        return null;
      }
      return { value: str, end: i + 1 };
    }

    // Literal string
    if (ch === "'") {
      let i = pos + 1;
      while (i < content.length && content[i] !== "'") i++;
      if (i >= content.length) {
        errors.push({ line: lineNum, message: "Unterminated literal string" });
        return null;
      }
      return { value: content.slice(pos + 1, i), end: i + 1 };
    }

    // Array
    if (ch === "[") {
      const arr: TomlValue[] = [];
      let i = pos + 1;
      while (i < content.length) {
        // Skip whitespace and newlines
        while (i < content.length && /[\s]/.test(content[i])) i++;
        if (content[i] === "]") return { value: arr, end: i + 1 };
        if (content[i] === "#") {
          // skip comment inside array
          while (i < content.length && content[i] !== "\n") i++;
          continue;
        }
        const result = parseValue(content, i, lineNum);
        if (!result) return null;
        arr.push(result.value);
        i = result.end;
        while (i < content.length && /[\s]/.test(content[i])) i++;
        if (content[i] === ",") i++;
        else if (content[i] === "]") return { value: arr, end: i + 1 };
      }
      errors.push({ line: lineNum, message: "Unterminated array" });
      return null;
    }

    // Inline table
    if (ch === "{") {
      const obj: Record<string, TomlValue> = {};
      let i = pos + 1;
      while (i < content.length) {
        while (i < content.length && content[i] === " ") i++;
        if (content[i] === "}") return { value: obj, end: i + 1 };
        // parse key
        const keyResult = parseInlineKey(content, i, lineNum);
        if (!keyResult) return null;
        const { keys, end: afterKey } = keyResult;
        i = afterKey;
        while (i < content.length && content[i] === " ") i++;
        if (content[i] !== "=") {
          errors.push({ line: lineNum, message: "Expected '=' in inline table" });
          return null;
        }
        i++;
        const valResult = parseValue(content, i, lineNum);
        if (!valResult) return null;
        setNestedKey(obj, keys, valResult.value);
        i = valResult.end;
        while (i < content.length && content[i] === " ") i++;
        if (content[i] === ",") i++;
        else if (content[i] === "}") return { value: obj, end: i + 1 };
      }
      errors.push({ line: lineNum, message: "Unterminated inline table" });
      return null;
    }

    // Boolean
    if (content.startsWith("true", pos)) return { value: true, end: pos + 4 };
    if (content.startsWith("false", pos)) return { value: false, end: pos + 5 };

    // Number (int or float)
    const numMatch = content.slice(pos).match(/^[+-]?(?:0x[\da-fA-F_]+|0o[0-7_]+|0b[01_]+|\d[\d_]*(?:\.\d[\d_]*)?(?:[eE][+-]?\d[\d_]*)?)/);
    if (numMatch) {
      const raw = numMatch[0].replace(/_/g, "");
      const num = raw.startsWith("0x")
        ? parseInt(raw, 16)
        : raw.startsWith("0o")
        ? parseInt(raw.slice(2), 8)
        : raw.startsWith("0b")
        ? parseInt(raw.slice(2), 2)
        : raw.includes(".") || raw.includes("e") || raw.includes("E")
        ? parseFloat(raw)
        : parseInt(raw, 10);
      return { value: num, end: pos + numMatch[0].length };
    }

    errors.push({ line: lineNum, message: `Unexpected value: ${content.slice(pos, pos + 20)}` });
    return null;
  }

  function parseInlineKey(
    content: string,
    pos: number,
    lineNum: number
  ): { keys: string[]; end: number } | null {
    const keys: string[] = [];
    let i = pos;
    while (true) {
      while (i < content.length && content[i] === " ") i++;
      let key = "";
      if (content[i] === '"') {
        const result = parseValue(content, i, lineNum);
        if (!result) return null;
        key = result.value as string;
        i = result.end;
      } else if (content[i] === "'") {
        const result = parseValue(content, i, lineNum);
        if (!result) return null;
        key = result.value as string;
        i = result.end;
      } else {
        const m = content.slice(i).match(/^[A-Za-z0-9_-]+/);
        if (!m) {
          errors.push({ line: lineNum, message: `Invalid key at: ${content.slice(i, i + 10)}` });
          return null;
        }
        key = m[0];
        i += m[0].length;
      }
      keys.push(key);
      while (i < content.length && content[i] === " ") i++;
      if (content[i] === ".") i++;
      else break;
    }
    return { keys, end: i };
  }

  // Join all lines for multi-line value parsing
  const fullContent = lines.join("\n");
  let lineIdx = 0;

  while (lineIdx < lines.length) {
    const rawLine = lines[lineIdx];
    const line = rawLine.replace(/#(?=(?:[^"']*["'][^"']*["'])*[^"']*$).*/, "").trim();
    const lineNum = lineIdx + 1;

    if (!line) {
      lineIdx++;
      continue;
    }

    // [[array of tables]]
    if (line.startsWith("[[")) {
      const m = line.match(/^\[\[([^\]]+)\]\]/);
      if (!m) {
        errors.push({ line: lineNum, message: `Invalid array-of-tables header: ${line}` });
        lineIdx++;
        continue;
      }
      const keys = m[1].split(".").map((k) => k.trim());
      // Navigate to parent
      let parent: Record<string, TomlValue> = root;
      for (let i = 0; i < keys.length - 1; i++) {
        const k = keys[i];
        if (!(k in parent)) parent[k] = {};
        const next = parent[k];
        if (Array.isArray(next)) {
          parent = next[next.length - 1] as Record<string, TomlValue>;
        } else {
          parent = next as Record<string, TomlValue>;
        }
      }
      const lastKey = keys[keys.length - 1];
      if (!(lastKey in parent)) parent[lastKey] = [];
      const arr = parent[lastKey] as TomlValue[];
      const newTable: Record<string, TomlValue> = {};
      arr.push(newTable);
      currentTable = newTable;
      lineIdx++;
      continue;
    }

    // [table]
    if (line.startsWith("[")) {
      const m = line.match(/^\[([^\]]+)\]/);
      if (!m) {
        errors.push({ line: lineNum, message: `Invalid table header: ${line}` });
        lineIdx++;
        continue;
      }
      const keys = m[1].split(".").map((k) => k.trim());
      currentTable = getNestedTable(root, keys);
      lineIdx++;
      continue;
    }

    // key = value
    const eqIdx = line.indexOf("=");
    if (eqIdx === -1) {
      errors.push({ line: lineNum, message: `Missing '=' in: ${line}` });
      lineIdx++;
      continue;
    }

    const keyPart = line.slice(0, eqIdx).trim();
    const rawValuePart = line.slice(eqIdx + 1).trim();

    // Parse dotted key
    const keyResult = parseInlineKey(keyPart + " ", 0, lineNum);
    if (!keyResult) {
      lineIdx++;
      continue;
    }
    const { keys } = keyResult;

    // Calculate absolute position in fullContent for value parsing
    let lineStartPos = 0;
    for (let i = 0; i < lineIdx; i++) {
      lineStartPos += lines[i].length + 1; // +1 for \n
    }
    const valueStartInLine = rawLine.indexOf("=") + 1;
    const valuePos = lineStartPos + valueStartInLine;

    const valResult = parseValue(fullContent, valuePos, lineNum);
    if (!valResult) {
      lineIdx++;
      continue;
    }

    setNestedKey(currentTable, keys, valResult.value);

    // If multiline value spans lines, advance lineIdx accordingly
    const endPos = valResult.end;
    let advancedLineStart = lineStartPos;
    let newLineIdx = lineIdx;
    while (newLineIdx < lines.length) {
      advancedLineStart += lines[newLineIdx].length + 1;
      newLineIdx++;
      if (advancedLineStart > endPos) break;
    }
    lineIdx = newLineIdx;
    continue;
  }

  if (errors.length > 0) {
    return { data: null, errors };
  }
  return { data: root, errors: [] };
}

// ============================================================
// Sample TOML
// ============================================================

const SAMPLE_TOML = `# App configuration
[app]
name = "my-app"
version = "1.0.0"
debug = false
port = 8080

[database]
host = "localhost"
port = 5432
name = "mydb"
pool_size = 10

[database.credentials]
user = "admin"
password = "secret"

[[server.routes]]
path = "/api"
methods = ["GET", "POST"]
auth_required = true

[[server.routes]]
path = "/health"
methods = ["GET"]
auth_required = false

[logging]
level = "info"
outputs = ["stdout", "file"]
max_size_mb = 100
`.trim();

// ============================================================
// Component
// ============================================================

export default function TomlToJson() {
  const [input, setInput] = useState(SAMPLE_TOML);
  const [output, setOutput] = useState("");
  const [errors, setErrors] = useState<{ line: number; message: string }[]>([]);
  const [copied, setCopied] = useState(false);

  const handleConvert = useCallback(() => {
    if (!input.trim()) return;
    const result = parseToml(input);
    if (result.errors.length > 0) {
      setErrors(result.errors);
      setOutput("");
    } else {
      setErrors([]);
      setOutput(JSON.stringify(result.data, null, 2));
    }
  }, [input]);

  const handleCopy = useCallback(async () => {
    if (!output) return;
    await navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [output]);

  const handleDownload = useCallback(() => {
    if (!output) return;
    const blob = new Blob([output], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "output.json";
    a.click();
    URL.revokeObjectURL(url);
  }, [output]);

  const handleClear = useCallback(() => {
    setInput("");
    setOutput("");
    setErrors([]);
    setCopied(false);
  }, []);

  const handleLoadSample = useCallback(() => {
    setInput(SAMPLE_TOML);
    setOutput("");
    setErrors([]);
  }, []);

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={handleConvert}
          className="px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors cursor-pointer"
        >
          Convert to JSON
        </button>
        <button
          onClick={handleCopy}
          disabled={!output}
          className="px-4 py-2 bg-white text-gray-700 text-sm font-medium rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
        >
          {copied ? "Copied!" : "Copy JSON"}
        </button>
        <button
          onClick={handleDownload}
          disabled={!output}
          className="px-4 py-2 bg-white text-gray-700 text-sm font-medium rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
        >
          Download .json
        </button>
        <button
          onClick={handleLoadSample}
          className="px-4 py-2 bg-white text-gray-700 text-sm font-medium rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors cursor-pointer"
        >
          Load Sample
        </button>
        <button
          onClick={handleClear}
          className="px-4 py-2 bg-white text-gray-700 text-sm font-medium rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors cursor-pointer"
        >
          Clear
        </button>
      </div>

      {/* Editor panels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Input TOML
          </label>
          <textarea
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              setErrors([]);
            }}
            placeholder="Paste your TOML here..."
            spellCheck={false}
            className="w-full h-96 p-3 font-mono text-sm bg-gray-50 border border-gray-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-transparent"
          />
        </div>

        {/* Output */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            JSON Output
          </label>
          <textarea
            value={output}
            readOnly
            placeholder="JSON output will appear here..."
            spellCheck={false}
            className="w-full h-96 p-3 font-mono text-sm bg-gray-50 border border-gray-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-transparent"
          />
        </div>
      </div>

      {/* Errors */}
      {errors.length > 0 && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4">
          <p className="text-sm font-medium text-red-800 mb-2">
            Parse errors — fix these before converting:
          </p>
          <ul className="space-y-1">
            {errors.map((err, i) => (
              <li key={i} className="text-sm font-mono text-red-700">
                Line {err.line}: {err.message}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Success hint */}
      {output && errors.length === 0 && (
        <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg p-3">
          <span className="font-medium">Conversion successful.</span>
          <span className="text-green-600">
            {output.split("\n").length} lines of JSON.
          </span>
        </div>
      )}
    
      {/* FAQ */}
      <section className="mt-12 space-y-4">
        <h2 className="text-lg font-bold text-gray-800">Frequently Asked Questions</h2>
        <div className="space-y-3">
    <details className="bg-gray-50 rounded-lg p-4 open:bg-gray-100">
      <summary className="font-medium text-gray-700 cursor-pointer select-none">What does this TOML to JSON Converter tool do?</summary>
      <p className="mt-2 text-sm text-gray-600">Convert TOML configuration files to JSON. Just enter your values and get instant results.</p>
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
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify({"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [{"@type": "Question", "name": "What does this TOML to JSON Converter tool do?", "acceptedAnswer": {"@type": "Answer", "text": "Convert TOML configuration files to JSON. Just enter your values and get instant results."}}, {"@type": "Question", "name": "Is this tool free to use?", "acceptedAnswer": {"@type": "Answer", "text": "Yes, completely free. No sign-up or account required."}}, {"@type": "Question", "name": "How accurate are the results?", "acceptedAnswer": {"@type": "Answer", "text": "Results are estimates based on standard formulas. For critical decisions, please consult a qualified professional."}}]})}} />
      
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: `{
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "TOML to JSON Converter",
  "description": "Convert TOML configuration files to JSON",
  "url": "https://tools.loresync.dev/toml-to-json",
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
