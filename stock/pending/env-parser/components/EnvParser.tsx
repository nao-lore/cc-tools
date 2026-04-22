"use client";

import { useState, useMemo } from "react";

const SAMPLE_ENV = `# Application
APP_NAME=MyApp
APP_ENV=production
APP_DEBUG=false
APP_URL=https://example.com

# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=mydb
DB_USER=admin
DB_PASSWORD="p@ssw0rd!secret"

# API Keys
STRIPE_KEY=sk_live_abcdef1234567890
SENDGRID_API_KEY=

# Duplicated key example
CACHE_DRIVER=redis
CACHE_DRIVER=file

# Invalid line
INVALID LINE WITHOUT EQUALS
`;

type ParsedEntry = {
  lineNum: number;
  key: string;
  value: string;
  raw: string;
  isComment: boolean;
  isEmpty: boolean;
  issues: string[];
};

type Tab = "table" | "json" | "yaml";

const SPECIAL_CHARS_RE = /[#\s$\\`"']/;

function parseEnv(input: string): ParsedEntry[] {
  const lines = input.split("\n");
  const seenKeys: Record<string, number[]> = {};

  const entries: ParsedEntry[] = lines.map((raw, i) => {
    const lineNum = i + 1;
    const trimmed = raw.trim();

    if (trimmed === "") {
      return { lineNum, key: "", value: "", raw, isComment: false, isEmpty: true, issues: [] };
    }
    if (trimmed.startsWith("#")) {
      return { lineNum, key: "", value: "", raw, isComment: true, isEmpty: false, issues: [] };
    }

    const eqIdx = trimmed.indexOf("=");
    if (eqIdx === -1) {
      return {
        lineNum, key: trimmed, value: "", raw,
        isComment: false, isEmpty: false,
        issues: ["Invalid line: missing '='"],
      };
    }

    const key = trimmed.slice(0, eqIdx).trim();
    let value = trimmed.slice(eqIdx + 1).trim();
    const issues: string[] = [];

    // Strip surrounding quotes for display
    let displayValue = value;
    if (
      (displayValue.startsWith('"') && displayValue.endsWith('"')) ||
      (displayValue.startsWith("'") && displayValue.endsWith("'"))
    ) {
      displayValue = displayValue.slice(1, -1);
    }

    if (!key) issues.push("Empty key");
    if (displayValue === "") issues.push("Empty value");
    if (key && !/^[A-Z_][A-Z0-9_]*$/i.test(key)) issues.push("Key contains unusual characters");
    if (
      displayValue !== "" &&
      SPECIAL_CHARS_RE.test(displayValue) &&
      !(value.startsWith('"') || value.startsWith("'"))
    ) {
      issues.push("Value has special characters but is not quoted");
    }

    if (key) {
      seenKeys[key] = seenKeys[key] || [];
      seenKeys[key].push(lineNum);
    }

    return { lineNum, key, value: displayValue, raw, isComment: false, isEmpty: false, issues };
  });

  // Second pass: mark duplicates
  for (const entry of entries) {
    if (!entry.isComment && !entry.isEmpty && entry.key) {
      const lines = seenKeys[entry.key];
      if (lines && lines.length > 1 && lines[0] !== entry.lineNum) {
        entry.issues.push(`Duplicate key (first seen on line ${lines[0]})`);
      } else if (lines && lines.length > 1 && lines[0] === entry.lineNum) {
        entry.issues.push(`Duplicate key (also on line${lines.slice(1).map(l => " " + l).join(",")})`);
      }
    }
  }

  return entries;
}

function toJson(entries: ParsedEntry[]): string {
  const obj: Record<string, string> = {};
  for (const e of entries) {
    if (!e.isComment && !e.isEmpty && e.key && !e.issues.some(i => i.startsWith("Invalid"))) {
      obj[e.key] = e.value;
    }
  }
  return JSON.stringify(obj, null, 2);
}

function toYaml(entries: ParsedEntry[]): string {
  const lines: string[] = [];
  for (const e of entries) {
    if (!e.isComment && !e.isEmpty && e.key && !e.issues.some(i => i.startsWith("Invalid"))) {
      const needsQuotes = /[:#\[\]{},&*?|<>=!%@`]/.test(e.value) || e.value === "";
      const val = needsQuotes ? `"${e.value.replace(/"/g, '\\"')}"` : e.value;
      lines.push(`${e.key}: ${val}`);
    }
  }
  return lines.join("\n");
}

function copyToClipboard(text: string, setCopied: (v: boolean) => void) {
  navigator.clipboard.writeText(text).then(() => {
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  });
}

export default function EnvParser() {
  const [input, setInput] = useState("");
  const [activeTab, setActiveTab] = useState<Tab>("table");
  const [copiedTable, setCopiedTable] = useState(false);
  const [copiedJson, setCopiedJson] = useState(false);
  const [copiedYaml, setCopiedYaml] = useState(false);

  const entries = useMemo(() => (input.trim() ? parseEnv(input) : []), [input]);

  const dataEntries = useMemo(
    () => entries.filter(e => !e.isComment && !e.isEmpty),
    [entries]
  );

  const totalKeys = useMemo(
    () => dataEntries.filter(e => e.key && !e.issues.some(i => i.startsWith("Invalid"))).length,
    [dataEntries]
  );

  const duplicateCount = useMemo(() => {
    const seen: Record<string, number> = {};
    for (const e of dataEntries) {
      if (e.key) seen[e.key] = (seen[e.key] || 0) + 1;
    }
    return Object.values(seen).filter(c => c > 1).length;
  }, [dataEntries]);

  const warningCount = useMemo(
    () => dataEntries.filter(e => e.issues.length > 0).length,
    [dataEntries]
  );

  const jsonOutput = useMemo(() => (entries.length ? toJson(entries) : ""), [entries]);
  const yamlOutput = useMemo(() => (entries.length ? toYaml(entries) : ""), [entries]);

  const tableText = useMemo(
    () =>
      dataEntries
        .filter(e => e.key)
        .map(e => `${e.key}=${e.value}`)
        .join("\n"),
    [dataEntries]
  );

  const hasInput = input.trim().length > 0;

  return (
    <div className="space-y-6">
      {/* Input */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-gray-50">
          <span className="text-sm font-medium text-gray-700">.env Content</span>
          <button
            onClick={() => setInput(SAMPLE_ENV)}
            className="text-xs text-blue-600 hover:text-blue-800 px-3 py-1 bg-blue-50 hover:bg-blue-100 rounded-md transition-colors"
          >
            Load Sample
          </button>
        </div>
        <textarea
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder={"Paste your .env file content here...\n\nExample:\nAPP_NAME=MyApp\nDB_HOST=localhost\nAPI_KEY=secret"}
          className="w-full h-48 px-4 py-3 font-mono text-sm text-gray-800 placeholder-gray-400 resize-y focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset"
          spellCheck={false}
        />
      </div>

      {/* Stats bar */}
      {hasInput && (
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white border border-gray-200 rounded-lg px-4 py-3 text-center shadow-sm">
            <div className="text-2xl font-bold text-gray-900">{totalKeys}</div>
            <div className="text-xs text-gray-500 mt-0.5">Total Keys</div>
          </div>
          <div className={`border rounded-lg px-4 py-3 text-center shadow-sm ${duplicateCount > 0 ? "bg-amber-50 border-amber-200" : "bg-white border-gray-200"}`}>
            <div className={`text-2xl font-bold ${duplicateCount > 0 ? "text-amber-600" : "text-gray-900"}`}>{duplicateCount}</div>
            <div className="text-xs text-gray-500 mt-0.5">Duplicates</div>
          </div>
          <div className={`border rounded-lg px-4 py-3 text-center shadow-sm ${warningCount > 0 ? "bg-red-50 border-red-200" : "bg-white border-gray-200"}`}>
            <div className={`text-2xl font-bold ${warningCount > 0 ? "text-red-600" : "text-gray-900"}`}>{warningCount}</div>
            <div className="text-xs text-gray-500 mt-0.5">Warnings</div>
          </div>
        </div>
      )}

      {/* Output tabs */}
      {hasInput && (
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
          {/* Tab bar */}
          <div className="flex border-b border-gray-200 bg-gray-50">
            {(["table", "json", "yaml"] as Tab[]).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-5 py-3 text-sm font-medium transition-colors ${
                  activeTab === tab
                    ? "text-blue-600 border-b-2 border-blue-600 bg-white"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                {tab === "table" ? "Parsed Table" : tab.toUpperCase()}
              </button>
            ))}
            <div className="flex-1" />
            {activeTab === "table" && (
              <button
                onClick={() => copyToClipboard(tableText, setCopiedTable)}
                className="px-4 py-2 text-xs text-gray-500 hover:text-gray-700 transition-colors"
              >
                {copiedTable ? "Copied!" : "Copy"}
              </button>
            )}
            {activeTab === "json" && (
              <button
                onClick={() => copyToClipboard(jsonOutput, setCopiedJson)}
                className="px-4 py-2 text-xs text-gray-500 hover:text-gray-700 transition-colors"
              >
                {copiedJson ? "Copied!" : "Copy"}
              </button>
            )}
            {activeTab === "yaml" && (
              <button
                onClick={() => copyToClipboard(yamlOutput, setCopiedYaml)}
                className="px-4 py-2 text-xs text-gray-500 hover:text-gray-700 transition-colors"
              >
                {copiedYaml ? "Copied!" : "Copy"}
              </button>
            )}
          </div>

          {/* Table tab */}
          {activeTab === "table" && (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="text-left px-4 py-2 font-medium text-gray-600 w-12">#</th>
                    <th className="text-left px-4 py-2 font-medium text-gray-600 w-1/3">Key</th>
                    <th className="text-left px-4 py-2 font-medium text-gray-600">Value</th>
                    <th className="text-left px-4 py-2 font-medium text-gray-600 w-1/4">Issues</th>
                  </tr>
                </thead>
                <tbody>
                  {entries.map((entry, idx) => {
                    if (entry.isEmpty) return null;
                    if (entry.isComment) {
                      return (
                        <tr key={idx} className="border-b border-gray-100 bg-gray-50">
                          <td className="px-4 py-2 text-gray-400 font-mono text-xs">{entry.lineNum}</td>
                          <td colSpan={3} className="px-4 py-2 text-gray-400 font-mono text-xs italic">{entry.raw.trim()}</td>
                        </tr>
                      );
                    }
                    const hasIssues = entry.issues.length > 0;
                    const isDuplicate = entry.issues.some(i => i.includes("Duplicate"));
                    const isInvalid = entry.issues.some(i => i.includes("Invalid") || i.includes("Empty key"));
                    const rowBg = isInvalid
                      ? "bg-red-50"
                      : isDuplicate
                      ? "bg-amber-50"
                      : hasIssues
                      ? "bg-yellow-50"
                      : "bg-white";
                    return (
                      <tr key={idx} className={`border-b border-gray-100 ${rowBg}`}>
                        <td className="px-4 py-2 text-gray-400 font-mono text-xs">{entry.lineNum}</td>
                        <td className="px-4 py-2 font-mono text-xs text-gray-800 font-medium break-all">{entry.key}</td>
                        <td className="px-4 py-2 font-mono text-xs text-gray-600 break-all">
                          {entry.value === "" ? (
                            <span className="text-gray-300 italic">empty</span>
                          ) : (
                            entry.value
                          )}
                        </td>
                        <td className="px-4 py-2">
                          {entry.issues.map((issue, i) => {
                            const color = issue.includes("Duplicate")
                              ? "text-amber-700 bg-amber-100"
                              : issue.includes("Invalid") || issue.includes("Empty key")
                              ? "text-red-700 bg-red-100"
                              : "text-yellow-700 bg-yellow-100";
                            return (
                              <span key={i} className={`inline-block text-xs px-1.5 py-0.5 rounded mr-1 mb-1 ${color}`}>
                                {issue}
                              </span>
                            );
                          })}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* JSON tab */}
          {activeTab === "json" && (
            <pre className="p-4 font-mono text-sm text-gray-800 overflow-x-auto whitespace-pre bg-white min-h-32">
              {jsonOutput || <span className="text-gray-400">No valid keys to convert.</span>}
            </pre>
          )}

          {/* YAML tab */}
          {activeTab === "yaml" && (
            <pre className="p-4 font-mono text-sm text-gray-800 overflow-x-auto whitespace-pre bg-white min-h-32">
              {yamlOutput || <span className="text-gray-400">No valid keys to convert.</span>}
            </pre>
          )}
        </div>
      )}

      {/* Empty state */}
      {!hasInput && (
        <div className="text-center py-12 text-gray-400 text-sm">
          Paste your <span className="font-mono">.env</span> content above or click <strong>Load Sample</strong> to try it out.
        </div>
      )}
    </div>
  );
}
