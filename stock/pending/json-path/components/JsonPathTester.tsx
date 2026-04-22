"use client";

import React, { useState, useCallback } from "react";

// ---- JSONPath engine ----

type JsonValue =
  | string
  | number
  | boolean
  | null
  | JsonValue[]
  | { [key: string]: JsonValue };

interface MatchResult {
  path: string;
  value: JsonValue;
}

function jsonPathQuery(root: JsonValue, expr: string): MatchResult[] {
  const results: MatchResult[] = [];

  if (!expr.startsWith("$")) return results;

  function collect(node: JsonValue, pathStr: string, segments: string[]): void {
    if (segments.length === 0) {
      results.push({ path: pathStr, value: node });
      return;
    }

    const [seg, ...rest] = segments;

    // Recursive descent: ..
    if (seg === "..") {
      // first try to match rest from current node
      collect(node, pathStr, rest);
      // then descend into children
      if (Array.isArray(node)) {
        node.forEach((child, i) => {
          collect(child, `${pathStr}[${i}]`, [".."].concat(rest));
        });
      } else if (node !== null && typeof node === "object") {
        Object.entries(node).forEach(([k, v]) => {
          collect(v, `${pathStr}.${k}`, [".."].concat(rest));
        });
      }
      return;
    }

    // Wildcard: *
    if (seg === "*") {
      if (Array.isArray(node)) {
        node.forEach((child, i) => collect(child, `${pathStr}[${i}]`, rest));
      } else if (node !== null && typeof node === "object") {
        Object.entries(node).forEach(([k, v]) =>
          collect(v, `${pathStr}.${k}`, rest)
        );
      }
      return;
    }

    // Array subscript: [n], [start:end], [*]
    const bracketMatch = seg.match(/^\[(.+)\]$/);
    if (bracketMatch) {
      const inner = bracketMatch[1].trim();

      if (inner === "*") {
        if (Array.isArray(node)) {
          node.forEach((child, i) =>
            collect(child, `${pathStr}[${i}]`, rest)
          );
        }
        return;
      }

      // Slice: start:end
      if (inner.includes(":")) {
        if (!Array.isArray(node)) return;
        const [startStr, endStr] = inner.split(":");
        const len = node.length;
        const start = startStr.trim() === "" ? 0 : parseInt(startStr, 10);
        const end = endStr.trim() === "" ? len : parseInt(endStr, 10);
        const s = start < 0 ? Math.max(len + start, 0) : Math.min(start, len);
        const e = end < 0 ? Math.max(len + end, 0) : Math.min(end, len);
        for (let i = s; i < e; i++) {
          collect(node[i], `${pathStr}[${i}]`, rest);
        }
        return;
      }

      // Index: [n]
      const idx = parseInt(inner, 10);
      if (!isNaN(idx)) {
        if (!Array.isArray(node)) return;
        const realIdx = idx < 0 ? node.length + idx : idx;
        if (realIdx >= 0 && realIdx < node.length) {
          collect(node[realIdx], `${pathStr}[${realIdx}]`, rest);
        }
        return;
      }

      // String key in brackets: ["key"]
      const quotedKey = inner.replace(/^['"]|['"]$/g, "");
      if (node !== null && typeof node === "object" && !Array.isArray(node)) {
        if (Object.prototype.hasOwnProperty.call(node, quotedKey)) {
          collect(
            (node as { [key: string]: JsonValue })[quotedKey],
            `${pathStr}["${quotedKey}"]`,
            rest
          );
        }
      }
      return;
    }

    // Dot-accessed key
    if (node !== null && typeof node === "object" && !Array.isArray(node)) {
      if (Object.prototype.hasOwnProperty.call(node, seg)) {
        collect(
          (node as { [key: string]: JsonValue })[seg],
          `${pathStr}.${seg}`,
          rest
        );
      }
    }
  }

  // Tokenize the expression after '$'
  function tokenize(expr: string): string[] {
    const tokens: string[] = [];
    let i = 1; // skip leading '$'
    while (i < expr.length) {
      if (expr[i] === ".") {
        i++;
        if (expr[i] === ".") {
          tokens.push("..");
          i++;
          // collect identifier after ..
          const start = i;
          while (i < expr.length && expr[i] !== "." && expr[i] !== "[") i++;
          if (i > start) tokens.push(expr.slice(start, i));
        } else {
          const start = i;
          while (i < expr.length && expr[i] !== "." && expr[i] !== "[") i++;
          if (i > start) tokens.push(expr.slice(start, i));
        }
      } else if (expr[i] === "[") {
        const end = expr.indexOf("]", i);
        if (end === -1) break;
        tokens.push(expr.slice(i, end + 1));
        i = end + 1;
      } else {
        // bare identifier at root level (shouldn't happen after $)
        const start = i;
        while (i < expr.length && expr[i] !== "." && expr[i] !== "[") i++;
        tokens.push(expr.slice(start, i));
      }
    }
    return tokens;
  }

  const tokens = tokenize(expr);
  collect(root, "$", tokens);
  return results;
}

// ---- Tree view ----

function TreeNode({
  value,
  keyName,
  depth,
  defaultExpanded,
}: {
  value: JsonValue;
  keyName?: string;
  depth: number;
  defaultExpanded: boolean;
}) {
  const [open, setOpen] = useState(defaultExpanded || depth < 2);

  const isObject =
    value !== null && typeof value === "object" && !Array.isArray(value);
  const isArray = Array.isArray(value);
  const isExpandable = isObject || isArray;
  const childCount = isExpandable
    ? isArray
      ? value.length
      : Object.keys(value as object).length
    : 0;

  const label = keyName !== undefined ? (
    <span className="text-purple-700 font-medium">&quot;{keyName}&quot;</span>
  ) : null;

  const colon = keyName !== undefined ? (
    <span className="text-gray-500">: </span>
  ) : null;

  if (!isExpandable) {
    let valueEl: React.ReactNode;
    if (value === null) valueEl = <span className="text-gray-400">null</span>;
    else if (typeof value === "boolean")
      valueEl = <span className="text-blue-600">{String(value)}</span>;
    else if (typeof value === "number")
      valueEl = <span className="text-orange-600">{value}</span>;
    else
      valueEl = (
        <span className="text-green-700">&quot;{String(value)}&quot;</span>
      );

    return (
      <div className="flex items-start pl-4 py-0.5 text-xs font-mono">
        {label}
        {colon}
        {valueEl}
      </div>
    );
  }

  const bracket = isArray ? ["[", "]"] : ["{", "}"];

  return (
    <div className="text-xs font-mono">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1 py-0.5 pl-4 hover:bg-gray-100 w-full text-left cursor-pointer"
      >
        <span className="text-gray-400 w-3 shrink-0">
          {open ? "▾" : "▸"}
        </span>
        {label}
        {colon}
        <span className="text-gray-600">
          {bracket[0]}
          {!open && (
            <span className="text-gray-400">
              {" "}
              {childCount} {isArray ? "items" : "keys"}{" "}
            </span>
          )}
          {!open && bracket[1]}
        </span>
      </button>
      {open && (
        <div className="pl-4">
          {isArray
            ? (value as JsonValue[]).map((child, i) => (
                <TreeNode
                  key={i}
                  value={child}
                  keyName={String(i)}
                  depth={depth + 1}
                  defaultExpanded={false}
                />
              ))
            : Object.entries(value as { [key: string]: JsonValue }).map(
                ([k, v]) => (
                  <TreeNode
                    key={k}
                    value={v}
                    keyName={k}
                    depth={depth + 1}
                    defaultExpanded={false}
                  />
                )
              )}
          <div className="pl-4 py-0.5 text-gray-600">{bracket[1]}</div>
        </div>
      )}
    </div>
  );
}

// ---- Syntax highlight for result display ----

function highlight(value: JsonValue): string {
  const json = JSON.stringify(value, null, 2);
  const escaped = json.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  return escaped.replace(
    /("(\\u[a-fA-F0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?|[{}\[\],])/g,
    (match) => {
      if (/^"/.test(match)) {
        if (/:$/.test(match))
          return `<span class="text-purple-700 font-medium">${match.slice(0, -1)}</span>:`;
        return `<span class="text-green-700">${match}</span>`;
      }
      if (/true|false/.test(match))
        return `<span class="text-blue-600">${match}</span>`;
      if (/null/.test(match))
        return `<span class="text-gray-400">${match}</span>`;
      if (/[{}\[\],]/.test(match))
        return `<span class="text-gray-500">${match}</span>`;
      return `<span class="text-orange-600">${match}</span>`;
    }
  );
}

// ---- Examples ----

const EXAMPLE_EXPRESSIONS = [
  { label: "All items", expr: "$.store.book[*]" },
  { label: "All authors", expr: "$.store.book[*].author" },
  { label: "First book", expr: "$.store.book[0]" },
  { label: "Last book", expr: "$.store.book[-1]" },
  { label: "Books 0-1", expr: "$.store.book[0:2]" },
  { label: "All prices", expr: "$..price" },
  { label: "Bicycle", expr: "$.store.bicycle" },
  { label: "All values", expr: "$..*" },
];

const SAMPLE_JSON = `{
  "store": {
    "book": [
      {
        "category": "reference",
        "author": "Nigel Rees",
        "title": "Sayings of the Century",
        "price": 8.95
      },
      {
        "category": "fiction",
        "author": "Evelyn Waugh",
        "title": "Sword of Honour",
        "price": 12.99
      },
      {
        "category": "fiction",
        "author": "Herman Melville",
        "title": "Moby Dick",
        "price": 8.99
      }
    ],
    "bicycle": {
      "color": "red",
      "price": 19.95
    }
  }
}`;

const SYNTAX_REFERENCE = [
  { expr: "$", desc: "Root element" },
  { expr: ".", desc: "Child operator" },
  { expr: "..", desc: "Recursive descent" },
  { expr: "*", desc: "Wildcard (all elements)" },
  { expr: "[n]", desc: "Array index (0-based)" },
  { expr: "[-n]", desc: "Array index from end" },
  { expr: "[start:end]", desc: "Array slice" },
  { expr: "[*]", desc: "All array elements" },
  { expr: '["key"]', desc: "Child by key name" },
];

// ---- Main component ----

export default function JsonPathTester() {
  const [jsonInput, setJsonInput] = useState(SAMPLE_JSON);
  const [expression, setExpression] = useState("$.store.book[*].author");
  const [jsonError, setJsonError] = useState<string | null>(null);
  const [exprError, setExprError] = useState<string | null>(null);
  const [results, setResults] = useState<MatchResult[]>([]);
  const [parsed, setParsed] = useState<JsonValue | null>(null);
  const [activeTab, setActiveTab] = useState<"results" | "tree">("results");
  const [copied, setCopied] = useState<number | null>(null);

  const parseJson = useCallback(
    (text: string): JsonValue | null => {
      try {
        const p = JSON.parse(text);
        setJsonError(null);
        return p;
      } catch (e) {
        setJsonError((e as Error).message);
        return null;
      }
    },
    []
  );

  const handleFormat = useCallback(() => {
    const p = parseJson(jsonInput);
    if (p !== null) setJsonInput(JSON.stringify(p, null, 2));
  }, [jsonInput, parseJson]);

  const handleRun = useCallback(() => {
    setExprError(null);
    const p = parseJson(jsonInput);
    if (p === null) return;
    setParsed(p);
    if (!expression.trim()) {
      setExprError("Expression cannot be empty");
      setResults([]);
      return;
    }
    if (!expression.startsWith("$")) {
      setExprError('Expression must start with "$"');
      setResults([]);
      return;
    }
    try {
      const r = jsonPathQuery(p as JsonValue, expression);
      setResults(r);
      if (r.length === 0) setExprError("No matches found");
    } catch (e) {
      setExprError((e as Error).message);
      setResults([]);
    }
  }, [jsonInput, expression, parseJson]);

  const handleCopy = useCallback(
    async (text: string, idx: number) => {
      try {
        await navigator.clipboard.writeText(text);
      } catch {
        const ta = document.createElement("textarea");
        ta.value = text;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        document.body.removeChild(ta);
      }
      setCopied(idx);
      setTimeout(() => setCopied(null), 2000);
    },
    []
  );

  // Auto-parse for tree view whenever input changes
  const handleJsonChange = useCallback(
    (text: string) => {
      setJsonInput(text);
      setJsonError(null);
      setResults([]);
      const p = parseJson(text);
      if (p !== null) setParsed(p);
      else setParsed(null);
    },
    [parseJson]
  );

  // Initialize parsed on mount
  useState(() => {
    const p = parseJson(SAMPLE_JSON);
    if (p !== null) setParsed(p);
  });

  return (
    <div className="space-y-4">
      {/* Expression bar */}
      <div className="flex gap-2 items-start">
        <div className="flex-1">
          <label className="block text-xs font-medium text-gray-500 mb-1">
            JSONPath Expression
          </label>
          <input
            type="text"
            value={expression}
            onChange={(e) => {
              setExpression(e.target.value);
              setExprError(null);
            }}
            onKeyDown={(e) => e.key === "Enter" && handleRun()}
            placeholder="$.store.book[*].author"
            spellCheck={false}
            className="w-full px-3 py-2 font-mono text-sm border border-gray-300 rounded-lg bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-300 placeholder-gray-400"
          />
        </div>
        <div className="pt-5">
          <button
            onClick={handleRun}
            className="px-5 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors cursor-pointer"
          >
            Run
          </button>
        </div>
      </div>

      {/* Quick-fill examples */}
      <div className="flex flex-wrap gap-2">
        {EXAMPLE_EXPRESSIONS.map(({ label, expr }) => (
          <button
            key={expr}
            onClick={() => {
              setExpression(expr);
              setExprError(null);
            }}
            className="px-2.5 py-1 text-xs bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-md transition-colors cursor-pointer font-mono"
          >
            {label}
          </button>
        ))}
      </div>

      {/* Expression error */}
      {exprError && (
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-700">
          {exprError}
        </div>
      )}

      {/* Main panels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Left: JSON input */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-500">
              JSON Data
            </label>
            <button
              onClick={handleFormat}
              className="text-xs px-2.5 py-1 border border-gray-300 rounded-md hover:bg-gray-50 text-gray-600 transition-colors cursor-pointer"
            >
              Format
            </button>
          </div>
          <textarea
            value={jsonInput}
            onChange={(e) => handleJsonChange(e.target.value)}
            placeholder='Paste your JSON here...'
            spellCheck={false}
            className="w-full h-96 p-4 font-mono text-sm border border-gray-200 rounded-lg bg-gray-50 text-gray-800 resize-y focus:outline-none focus:ring-2 focus:ring-gray-300 placeholder-gray-400"
          />
          {jsonError && (
            <div className="p-2 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 font-mono">
              {jsonError}
            </div>
          )}
        </div>

        {/* Right: Results / Tree */}
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="flex border border-gray-200 rounded-lg overflow-hidden">
              <button
                onClick={() => setActiveTab("results")}
                className={`px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer ${
                  activeTab === "results"
                    ? "bg-gray-900 text-white"
                    : "bg-white text-gray-600 hover:bg-gray-50"
                }`}
              >
                Results{results.length > 0 && ` (${results.length})`}
              </button>
              <button
                onClick={() => setActiveTab("tree")}
                className={`px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer ${
                  activeTab === "tree"
                    ? "bg-gray-900 text-white"
                    : "bg-white text-gray-600 hover:bg-gray-50"
                }`}
              >
                Tree View
              </button>
            </div>
          </div>

          <div className="h-96 border border-gray-200 rounded-lg overflow-auto bg-white">
            {activeTab === "results" ? (
              results.length === 0 ? (
                <div className="flex items-center justify-center h-full text-gray-400 text-sm">
                  {jsonError
                    ? "Fix JSON errors to query"
                    : "Run a query to see results"}
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {results.map((r, i) => (
                    <div key={i} className="p-3 hover:bg-gray-50 group">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-mono text-blue-600 font-medium">
                          {r.path}
                        </span>
                        <button
                          onClick={() =>
                            handleCopy(JSON.stringify(r.value, null, 2), i)
                          }
                          className="text-xs text-gray-400 hover:text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer px-1.5 py-0.5 rounded border border-gray-200 hover:border-gray-300"
                        >
                          {copied === i ? "Copied!" : "Copy"}
                        </button>
                      </div>
                      <pre
                        className="text-xs font-mono whitespace-pre-wrap break-words text-gray-800"
                        dangerouslySetInnerHTML={{
                          __html: highlight(r.value),
                        }}
                      />
                    </div>
                  ))}
                </div>
              )
            ) : parsed !== null ? (
              <div className="py-2">
                <TreeNode
                  value={parsed}
                  depth={0}
                  defaultExpanded={true}
                />
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-400 text-sm">
                Enter valid JSON to see tree
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Syntax reference */}
      <div className="border border-gray-200 rounded-lg overflow-hidden">
        <div className="px-4 py-2 bg-gray-50 border-b border-gray-200">
          <h3 className="text-sm font-medium text-gray-700">
            JSONPath Syntax Reference
          </h3>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-0 divide-x divide-y divide-gray-100">
          {SYNTAX_REFERENCE.map(({ expr, desc }) => (
            <div key={expr} className="px-3 py-2.5">
              <code className="block text-xs font-mono text-blue-700 font-semibold mb-0.5">
                {expr}
              </code>
              <span className="text-xs text-gray-500">{desc}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
