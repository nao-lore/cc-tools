"use client";

import { useState } from "react";

// ============================================================
// INI Parser
// Handles: [sections], key=value, key:value,
//          ; and # comments, quoted values,
//          backslash line continuation, global keys
// ============================================================

type IniData = Record<string, Record<string, string> | string>;

interface ParseError {
  line: number;
  message: string;
}

interface ParseResult {
  data: IniData | null;
  errors: ParseError[];
}

function parseIni(input: string): ParseResult {
  const errors: ParseError[] = [];
  const result: IniData = {};
  // Global section for keys before any [section]
  const GLOBAL = "__global__";
  let currentSection: string = GLOBAL;

  const rawLines = input.split("\n");
  const lines: string[] = [];

  // Resolve backslash line continuations first
  let i = 0;
  while (i < rawLines.length) {
    let line = rawLines[i];
    // Strip trailing \r
    if (line.endsWith("\r")) line = line.slice(0, -1);
    while (line.endsWith("\\") && i + 1 < rawLines.length) {
      line = line.slice(0, -1).trimEnd() + " " + rawLines[i + 1].trimStart();
      i++;
    }
    lines.push(line);
    i++;
  }

  for (let ln = 0; ln < lines.length; ln++) {
    const lineNum = ln + 1;
    let line = lines[ln];

    // Strip inline comments (; or # not inside quotes)
    line = stripComment(line);
    line = line.trim();

    if (!line) continue;

    // Section header
    if (line.startsWith("[")) {
      const end = line.indexOf("]");
      if (end === -1) {
        errors.push({ line: lineNum, message: `Unterminated section header: ${line.slice(0, 40)}` });
        continue;
      }
      currentSection = line.slice(1, end).trim();
      if (!currentSection) {
        errors.push({ line: lineNum, message: "Empty section name" });
        currentSection = GLOBAL;
        continue;
      }
      if (!(currentSection in result)) {
        result[currentSection] = {};
      }
      continue;
    }

    // Key-value pair (= or :)
    const eqIdx = findDelimiter(line);
    if (eqIdx === -1) {
      errors.push({ line: lineNum, message: `Expected '=' or ':' in: ${line.slice(0, 40)}` });
      continue;
    }

    const key = line.slice(0, eqIdx).trim();
    const rawVal = line.slice(eqIdx + 1).trim();
    const value = unquote(rawVal);

    if (!key) {
      errors.push({ line: lineNum, message: `Empty key on line ${lineNum}` });
      continue;
    }

    if (currentSection === GLOBAL) {
      result[key] = value;
    } else {
      if (typeof result[currentSection] !== "object") {
        result[currentSection] = {};
      }
      (result[currentSection] as Record<string, string>)[key] = value;
    }
  }

  // Remove __global__ if empty, or flatten it to top level
  if (GLOBAL in result) {
    const globalVal = result[GLOBAL];
    delete result[GLOBAL];
    if (typeof globalVal === "object") {
      for (const [k, v] of Object.entries(globalVal)) {
        if (!(k in result)) result[k] = v;
      }
    }
  }

  return {
    data: Object.keys(result).length > 0 ? result : {},
    errors,
  };
}

function stripComment(line: string): string {
  let inDouble = false;
  let inSingle = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (c === '"' && !inSingle) inDouble = !inDouble;
    else if (c === "'" && !inDouble) inSingle = !inSingle;
    else if ((c === ";" || c === "#") && !inDouble && !inSingle) {
      return line.slice(0, i);
    }
  }
  return line;
}

function findDelimiter(line: string): number {
  let inDouble = false;
  let inSingle = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (c === '"' && !inSingle) inDouble = !inDouble;
    else if (c === "'" && !inDouble) inSingle = !inSingle;
    else if ((c === "=" || c === ":") && !inDouble && !inSingle) return i;
  }
  return -1;
}

function unquote(val: string): string {
  if (
    (val.startsWith('"') && val.endsWith('"')) ||
    (val.startsWith("'") && val.endsWith("'"))
  ) {
    return val.slice(1, -1);
  }
  return val;
}

// ============================================================
// JSON to INI Converter
// ============================================================

function jsonToIni(jsonStr: string): { output: string; error: string | null } {
  let parsed: unknown;
  try {
    parsed = JSON.parse(jsonStr);
  } catch (e) {
    return { output: "", error: `Invalid JSON: ${(e as Error).message}` };
  }

  if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
    return { output: "", error: "JSON root must be an object" };
  }

  const obj = parsed as Record<string, unknown>;
  const globalLines: string[] = [];
  const sectionLines: string[] = [];

  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === "object" && value !== null && !Array.isArray(value)) {
      sectionLines.push(`[${key}]`);
      for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
        const strVal = typeof v === "string" ? v : JSON.stringify(v);
        sectionLines.push(`${k} = ${strVal}`);
      }
      sectionLines.push("");
    } else {
      const strVal = typeof value === "string" ? value : JSON.stringify(value);
      globalLines.push(`${key} = ${strVal}`);
    }
  }

  const parts: string[] = [];
  if (globalLines.length > 0) {
    parts.push(globalLines.join("\n"));
    parts.push("");
  }
  if (sectionLines.length > 0) {
    parts.push(sectionLines.join("\n").trimEnd());
  }

  return { output: parts.join("\n").trimEnd(), error: null };
}

// ============================================================
// Sample data
// ============================================================

const SAMPLE_INI = `; Application configuration
[app]
name = My Application
version = 2.1.0
debug = false

[database]
host = localhost
port = 5432
name = mydb
# Use SSL in production
ssl = true

[server]
host = 0.0.0.0
port = 8080
workers = 4
log_level = info

[paths]
data_dir = /var/data
log_file = /var/log/app.log
temp_dir = /tmp/app
`;

// ============================================================
// Component
// ============================================================

type Direction = "ini-to-json" | "json-to-ini";

export default function IniToJson() {
  const [direction, setDirection] = useState<Direction>("ini-to-json");
  const [iniInput, setIniInput] = useState<string>(SAMPLE_INI);
  const [jsonInput, setJsonInput] = useState<string>("");
  const [copiedOutput, setCopiedOutput] = useState(false);

  // INI -> JSON
  const parseResult = parseIni(iniInput);
  const jsonOutput =
    parseResult.data !== null
      ? JSON.stringify(parseResult.data, null, 2)
      : "";

  // JSON -> INI
  const iniResult = jsonToIni(jsonInput);

  const outputText =
    direction === "ini-to-json" ? jsonOutput : iniResult.output;

  const hasErrors =
    direction === "ini-to-json"
      ? parseResult.errors.length > 0
      : !!iniResult.error;

  const handleCopyOutput = async () => {
    try {
      await navigator.clipboard.writeText(outputText);
      setCopiedOutput(true);
      setTimeout(() => setCopiedOutput(false), 2000);
    } catch {
      // fallback silently
    }
  };

  const handleDownload = () => {
    const ext = direction === "ini-to-json" ? "json" : "ini";
    const mime =
      direction === "ini-to-json" ? "application/json" : "text/plain";
    const blob = new Blob([outputText], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `converted.${ext}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleClear = () => {
    if (direction === "ini-to-json") setIniInput("");
    else setJsonInput("");
  };

  const handleLoadSample = () => {
    if (direction === "ini-to-json") {
      setIniInput(SAMPLE_INI);
    } else {
      // Load sample JSON (derived from sample INI)
      const { data } = parseIni(SAMPLE_INI);
      setJsonInput(JSON.stringify(data, null, 2));
    }
  };

  const tabs: { id: Direction; label: string }[] = [
    { id: "ini-to-json", label: "INI to JSON" },
    { id: "json-to-ini", label: "JSON to INI" },
  ];

  return (
    <div className="space-y-4">
      {/* Direction tabs */}
      <div className="flex items-center gap-0 border-b border-gray-200">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setDirection(tab.id)}
            className={`px-5 py-2.5 text-sm font-medium border-b-2 transition-colors cursor-pointer -mb-px ${
              direction === tab.id
                ? "border-gray-900 text-gray-900"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={handleLoadSample}
          className="px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors cursor-pointer"
        >
          Load Sample
        </button>
        <button
          onClick={handleClear}
          className="px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors cursor-pointer"
        >
          Clear
        </button>
      </div>

      {/* Main layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Input */}
        <div className="space-y-2">
          <h2 className="text-sm font-semibold text-gray-700">
            {direction === "ini-to-json" ? "Input INI" : "Input JSON"}
          </h2>
          <textarea
            value={direction === "ini-to-json" ? iniInput : jsonInput}
            onChange={(e) =>
              direction === "ini-to-json"
                ? setIniInput(e.target.value)
                : setJsonInput(e.target.value)
            }
            className="w-full h-96 p-4 font-mono text-sm bg-gray-50 border border-gray-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-gray-300 transition-all"
            placeholder={
              direction === "ini-to-json"
                ? "Paste your INI config here..."
                : "Paste your JSON here..."
            }
            spellCheck={false}
          />
        </div>

        {/* Output */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-gray-700">
              {direction === "ini-to-json" ? "Output JSON" : "Output INI"}
            </h2>
            <div className="flex items-center gap-2">
              <button
                onClick={handleCopyOutput}
                disabled={!outputText}
                className="px-3 py-1.5 text-xs text-gray-600 border border-gray-200 rounded hover:bg-gray-50 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {copiedOutput ? "Copied!" : "Copy"}
              </button>
              <button
                onClick={handleDownload}
                disabled={!outputText}
                className="px-3 py-1.5 text-xs text-gray-600 border border-gray-200 rounded hover:bg-gray-50 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Download
              </button>
            </div>
          </div>
          <textarea
            readOnly
            value={outputText}
            className="w-full h-96 p-4 font-mono text-sm bg-gray-50 border border-gray-200 rounded-lg resize-none focus:outline-none"
            placeholder={
              direction === "ini-to-json"
                ? "JSON output will appear here..."
                : "INI output will appear here..."
            }
            spellCheck={false}
          />
        </div>
      </div>

      {/* Errors */}
      {hasErrors && direction === "ini-to-json" && parseResult.errors.length > 0 && (
        <div className="border border-red-200 bg-red-50 rounded-lg p-4 space-y-1">
          <p className="text-sm font-semibold text-red-700 mb-2">
            {parseResult.errors.length} parse error
            {parseResult.errors.length !== 1 ? "s" : ""}
          </p>
          {parseResult.errors.map((err, idx) => (
            <div key={idx} className="flex items-start gap-3 text-sm text-red-700 font-mono">
              <span className="shrink-0 bg-red-100 text-red-600 px-1.5 py-0.5 rounded text-xs">
                Line {err.line}
              </span>
              <span>{err.message}</span>
            </div>
          ))}
        </div>
      )}

      {hasErrors && direction === "json-to-ini" && iniResult.error && (
        <div className="border border-red-200 bg-red-50 rounded-lg p-4">
          <p className="text-sm text-red-700">{iniResult.error}</p>
        </div>
      )}

      {/* Valid badge */}
      {!hasErrors &&
        (direction === "ini-to-json" ? iniInput.trim() : jsonInput.trim()) &&
        outputText && (
          <div className="flex items-center gap-2 text-sm text-green-700">
            <span className="w-2 h-2 bg-green-500 rounded-full inline-block"></span>
            {direction === "ini-to-json"
              ? "Valid INI — converted successfully"
              : "Valid JSON — converted successfully"}
          </div>
        )}
    
      {/* FAQ */}
      <section className="mt-12 space-y-4">
        <h2 className="text-lg font-bold text-gray-800">Frequently Asked Questions</h2>
        <div className="space-y-3">
    <details className="bg-gray-50 rounded-lg p-4 open:bg-gray-100">
      <summary className="font-medium text-gray-700 cursor-pointer select-none">What does this INI to JSON Converter tool do?</summary>
      <p className="mt-2 text-sm text-gray-600">Convert INI/config files to JSON objects. Just enter your values and get instant results.</p>
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
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify({"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [{"@type": "Question", "name": "What does this INI to JSON Converter tool do?", "acceptedAnswer": {"@type": "Answer", "text": "Convert INI/config files to JSON objects. Just enter your values and get instant results."}}, {"@type": "Question", "name": "Is this tool free to use?", "acceptedAnswer": {"@type": "Answer", "text": "Yes, completely free. No sign-up or account required."}}, {"@type": "Question", "name": "How accurate are the results?", "acceptedAnswer": {"@type": "Answer", "text": "Results are estimates based on standard formulas. For critical decisions, please consult a qualified professional."}}]})}} />
      </div>
  );
}
