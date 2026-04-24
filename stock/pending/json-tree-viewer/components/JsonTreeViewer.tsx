"use client";

import { useState, useCallback, useMemo } from "react";

type JsonValue =
  | string
  | number
  | boolean
  | null
  | JsonValue[]
  | { [key: string]: JsonValue };

function getType(val: JsonValue): string {
  if (val === null) return "null";
  if (Array.isArray(val)) return "array";
  return typeof val;
}

function countNodes(val: JsonValue): number {
  if (val === null || typeof val !== "object") return 1;
  if (Array.isArray(val)) {
    return 1 + val.reduce((s: number, v: JsonValue) => s + countNodes(v), 0);
  }
  return (
    1 +
    Object.values(val as { [key: string]: JsonValue }).reduce(
      (s: number, v: JsonValue) => s + countNodes(v),
      0
    )
  );
}

function buildPath(parentPath: string, key: string | number): string {
  if (typeof key === "number") return `${parentPath}[${key}]`;
  if (/^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(key)) return `${parentPath}.${key}`;
  return `${parentPath}["${key}"]`;
}

function matchesSearch(val: JsonValue, key: string, query: string): boolean {
  if (!query) return false;
  const q = query.toLowerCase();
  if (String(key).toLowerCase().includes(q)) return true;
  if (typeof val === "string" && val.toLowerCase().includes(q)) return true;
  if (typeof val === "number" && String(val).includes(q)) return true;
  if (typeof val === "boolean" && String(val).includes(q)) return true;
  return false;
}

function subtreeMatchesSearch(val: JsonValue, query: string): boolean {
  if (!query) return false;
  if (typeof val !== "object" || val === null) {
    const q = query.toLowerCase();
    if (typeof val === "string" && val.toLowerCase().includes(q)) return true;
    if (typeof val === "number" && String(val).includes(q)) return true;
    if (typeof val === "boolean" && String(val).includes(q)) return true;
    return false;
  }
  if (Array.isArray(val)) {
    return val.some((v) => subtreeMatchesSearch(v, query));
  }
  return Object.entries(val as { [key: string]: JsonValue }).some(
    ([k, v]) =>
      k.toLowerCase().includes(query.toLowerCase()) ||
      subtreeMatchesSearch(v, query)
  );
}

interface TreeNodeProps {
  nodeKey: string | number;
  value: JsonValue;
  path: string;
  depth: number;
  search: string;
  expandAll: boolean;
  collapseAll: boolean;
  expandAllVersion: number;
  collapseAllVersion: number;
  onCopy: (text: string, type: "path" | "value") => void;
}

function TreeNode({
  nodeKey,
  value,
  path,
  depth,
  search,
  expandAll,
  collapseAll,
  expandAllVersion,
  collapseAllVersion,
  onCopy,
}: TreeNodeProps) {
  const type = getType(value);
  const isExpandable = type === "object" || type === "array";

  const [expanded, setExpanded] = useState(true);

  // Sync with expand/collapse all
  const [lastExpandVer, setLastExpandVer] = useState(expandAllVersion);
  const [lastCollapseVer, setLastCollapseVer] = useState(collapseAllVersion);

  if (expandAll && expandAllVersion !== lastExpandVer) {
    setExpanded(true);
    setLastExpandVer(expandAllVersion);
  }
  if (collapseAll && collapseAllVersion !== lastCollapseVer) {
    setExpanded(false);
    setLastCollapseVer(collapseAllVersion);
  }

  const isHighlighted =
    search.length > 0 && matchesSearch(value, String(nodeKey), search);
  const childHasMatch =
    search.length > 0 && isExpandable && subtreeMatchesSearch(value, search);

  // Auto-expand if search matches something in subtree
  const shouldExpand = expanded || (search.length > 0 && childHasMatch);

  const keyColor = "text-purple-600";

  const valueDisplay = useMemo(() => {
    if (type === "string")
      return (
        <span className="text-green-600 dark:text-green-400">
          &quot;{value as string}&quot;
        </span>
      );
    if (type === "number")
      return (
        <span className="text-orange-500 dark:text-orange-400">
          {String(value)}
        </span>
      );
    if (type === "boolean")
      return (
        <span className="text-blue-500 dark:text-blue-400">
          {String(value)}
        </span>
      );
    if (type === "null")
      return <span className="text-gray-400 dark:text-gray-500">null</span>;
    return null;
  }, [type, value]);

  const childCount = useMemo(() => {
    if (type === "array") return (value as JsonValue[]).length;
    if (type === "object")
      return Object.keys(value as { [key: string]: JsonValue }).length;
    return 0;
  }, [type, value]);

  const indent = depth * 16;

  const handleCopyPath = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onCopy(path, "path");
    },
    [path, onCopy]
  );

  const handleCopyValue = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      const text =
        typeof value === "string"
          ? value
          : JSON.stringify(value, null, 2);
      onCopy(text, "value");
    },
    [value, onCopy]
  );

  const rowBg = isHighlighted
    ? "bg-yellow-100 dark:bg-yellow-900/30"
    : "hover:bg-gray-50 dark:hover:bg-gray-800/50";

  return (
    <div>
      <div
        className={`flex items-start gap-1 py-0.5 px-2 rounded group cursor-pointer select-none ${rowBg}`}
        style={{ paddingLeft: `${indent + 8}px` }}
        onClick={() => isExpandable && setExpanded((e) => !e)}
      >
        {/* Toggle arrow */}
        <span className="w-4 flex-shrink-0 text-gray-400 text-xs mt-0.5">
          {isExpandable ? (shouldExpand ? "▼" : "▶") : ""}
        </span>

        {/* Key */}
        <span className={`font-mono text-sm ${keyColor} flex-shrink-0`}>
          {String(nodeKey)}
        </span>
        <span className="text-gray-400 text-sm flex-shrink-0">:</span>

        {/* Value or type hint */}
        {!isExpandable ? (
          <span className="font-mono text-sm flex-1 min-w-0 break-all">
            {valueDisplay}
          </span>
        ) : (
          <span className="text-gray-400 text-sm font-mono flex-shrink-0">
            {type === "array" ? `[${childCount}]` : `{${childCount}}`}
          </span>
        )}

        {/* Copy buttons - visible on hover */}
        <span className="ml-auto flex gap-1 opacity-0 group-hover:opacity-100 flex-shrink-0">
          <button
            onClick={handleCopyPath}
            className="text-xs px-1.5 py-0.5 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 rounded text-gray-600 dark:text-gray-300 font-mono"
            title="Copy JSON path"
          >
            path
          </button>
          <button
            onClick={handleCopyValue}
            className="text-xs px-1.5 py-0.5 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 rounded text-gray-600 dark:text-gray-300 font-mono"
            title="Copy value"
          >
            copy
          </button>
        </span>
      </div>

      {/* Children */}
      {isExpandable && shouldExpand && (
        <div>
          {type === "array"
            ? (value as JsonValue[]).map((child, i) => {
                const childPath = `${path}[${i}]`;
                return (
                  <TreeNode
                    key={i}
                    nodeKey={i}
                    value={child}
                    path={childPath}
                    depth={depth + 1}
                    search={search}
                    expandAll={expandAll}
                    collapseAll={collapseAll}
                    expandAllVersion={expandAllVersion}
                    collapseAllVersion={collapseAllVersion}
                    onCopy={onCopy}
                  />
                );
              })
            : Object.entries(value as { [key: string]: JsonValue }).map(
                ([k, v]) => {
                  const childPath = buildPath(path, k);
                  return (
                    <TreeNode
                      key={k}
                      nodeKey={k}
                      value={v}
                      path={childPath}
                      depth={depth + 1}
                      search={search}
                      expandAll={expandAll}
                      collapseAll={collapseAll}
                      expandAllVersion={expandAllVersion}
                      collapseAllVersion={collapseAllVersion}
                      onCopy={onCopy}
                    />
                  );
                }
              )}
        </div>
      )}
    </div>
  );
}

const SAMPLE_JSON = `{
  "store": {
    "name": "Book Haven",
    "open": true,
    "rating": 4.8,
    "address": null,
    "books": [
      {
        "title": "The Great Gatsby",
        "author": "F. Scott Fitzgerald",
        "price": 12.99,
        "inStock": true
      },
      {
        "title": "To Kill a Mockingbird",
        "author": "Harper Lee",
        "price": 9.99,
        "inStock": false
      }
    ],
    "tags": ["fiction", "classic", "literature"]
  }
}`;

export default function JsonTreeViewer() {
  const [input, setInput] = useState(SAMPLE_JSON);
  const [parsed, setParsed] = useState<JsonValue | null>(() => {
    try {
      return JSON.parse(SAMPLE_JSON);
    } catch {
      return null;
    }
  });
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [expandAllVersion, setExpandAllVersion] = useState(0);
  const [collapseAllVersion, setCollapseAllVersion] = useState(0);
  const [toast, setToast] = useState<{ text: string; type: "path" | "value" } | null>(null);

  const handleParse = useCallback((text: string) => {
    try {
      const result = JSON.parse(text);
      setParsed(result);
      setError(null);
    } catch (e) {
      setError((e as Error).message);
      setParsed(null);
    }
  }, []);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const text = e.target.value;
      setInput(text);
      if (text.trim() === "") {
        setParsed(null);
        setError(null);
        return;
      }
      handleParse(text);
    },
    [handleParse]
  );

  const handleFormat = useCallback(() => {
    try {
      const result = JSON.parse(input);
      const formatted = JSON.stringify(result, null, 2);
      setInput(formatted);
      setParsed(result);
      setError(null);
    } catch (e) {
      setError((e as Error).message);
    }
  }, [input]);

  const handleCopy = useCallback((text: string, type: "path" | "value") => {
    navigator.clipboard.writeText(text).then(() => {
      setToast({ text, type });
      setTimeout(() => setToast(null), 2000);
    });
  }, []);

  const nodeCount = useMemo(() => {
    if (parsed === null) return 0;
    return countNodes(parsed);
  }, [parsed]);

  const rootType = parsed !== null ? getType(parsed) : null;

  return (
    <div className="space-y-4">
      {/* Input area */}
      <div className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
        <div className="flex items-center justify-between px-4 py-2 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            JSON Input
          </span>
          <div className="flex gap-2">
            <button
              onClick={handleFormat}
              className="text-xs px-3 py-1 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-md hover:bg-gray-100 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 font-medium transition-colors"
            >
              Format
            </button>
            <button
              onClick={() => {
                setInput("");
                setParsed(null);
                setError(null);
              }}
              className="text-xs px-3 py-1 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-md hover:bg-gray-100 dark:hover:bg-gray-600 text-gray-500 dark:text-gray-400 transition-colors"
            >
              Clear
            </button>
          </div>
        </div>
        <textarea
          value={input}
          onChange={handleInputChange}
          placeholder="Paste or type JSON here..."
          className="w-full h-40 px-4 py-3 font-mono text-sm resize-y bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none"
          spellCheck={false}
        />
        {error && (
          <div className="px-4 py-2 bg-red-50 dark:bg-red-900/20 border-t border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm font-mono">
            {error}
          </div>
        )}
      </div>

      {/* Tree view */}
      {parsed !== null && (
        <div className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
          {/* Toolbar */}
          <div className="flex flex-wrap items-center gap-2 px-4 py-2 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search keys or values..."
              className="flex-1 min-w-40 text-sm px-3 py-1.5 border border-gray-200 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <div className="flex gap-2 flex-shrink-0">
              <button
                onClick={() => setExpandAllVersion((v) => v + 1)}
                className="text-xs px-3 py-1.5 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-md hover:bg-gray-100 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 transition-colors"
              >
                Expand All
              </button>
              <button
                onClick={() => setCollapseAllVersion((v) => v + 1)}
                className="text-xs px-3 py-1.5 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-md hover:bg-gray-100 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 transition-colors"
              >
                Collapse All
              </button>
            </div>
            <span className="text-xs text-gray-400 ml-auto flex-shrink-0">
              {nodeCount} nodes &middot; root: {rootType}
            </span>
          </div>

          {/* Tree */}
          <div className="overflow-auto max-h-[600px] py-2 bg-white dark:bg-gray-900">
            {rootType === "array"
              ? (parsed as JsonValue[]).map((child, i) => (
                  <TreeNode
                    key={i}
                    nodeKey={i}
                    value={child}
                    path={`$[${i}]`}
                    depth={0}
                    search={search}
                    expandAll={expandAllVersion > 0}
                    collapseAll={collapseAllVersion > 0}
                    expandAllVersion={expandAllVersion}
                    collapseAllVersion={collapseAllVersion}
                    onCopy={handleCopy}
                  />
                ))
              : rootType === "object"
              ? Object.entries(parsed as { [key: string]: JsonValue }).map(
                  ([k, v]) => (
                    <TreeNode
                      key={k}
                      nodeKey={k}
                      value={v}
                      path={`$.${k}`}
                      depth={0}
                      search={search}
                      expandAll={expandAllVersion > 0}
                      collapseAll={collapseAllVersion > 0}
                      expandAllVersion={expandAllVersion}
                      collapseAllVersion={collapseAllVersion}
                      onCopy={handleCopy}
                    />
                  )
                )
              : (
                <div className="px-4 py-2 font-mono text-sm">
                  {rootType === "string" && (
                    <span className="text-green-600">&quot;{parsed as string}&quot;</span>
                  )}
                  {rootType === "number" && (
                    <span className="text-orange-500">{String(parsed)}</span>
                  )}
                  {rootType === "boolean" && (
                    <span className="text-blue-500">{String(parsed)}</span>
                  )}
                  {rootType === "null" && (
                    <span className="text-gray-400">null</span>
                  )}
                </div>
              )}
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 text-sm px-4 py-2 rounded-lg shadow-lg font-mono max-w-sm truncate">
          Copied {toast.type}: {toast.text.length > 40 ? toast.text.slice(0, 40) + "…" : toast.text}
        </div>
      )}
    
      {/* FAQ */}
      <section className="mt-12 space-y-4">
        <h2 className="text-lg font-bold text-gray-800">Frequently Asked Questions</h2>
        <div className="space-y-3">
    <details className="bg-gray-50 rounded-lg p-4 open:bg-gray-100">
      <summary className="font-medium text-gray-700 cursor-pointer select-none">What does this JSON Tree Viewer tool do?</summary>
      <p className="mt-2 text-sm text-gray-600">Visualize JSON as an interactive collapsible tree. Just enter your values and get instant results.</p>
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
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify({"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [{"@type": "Question", "name": "What does this JSON Tree Viewer tool do?", "acceptedAnswer": {"@type": "Answer", "text": "Visualize JSON as an interactive collapsible tree. Just enter your values and get instant results."}}, {"@type": "Question", "name": "Is this tool free to use?", "acceptedAnswer": {"@type": "Answer", "text": "Yes, completely free. No sign-up or account required."}}, {"@type": "Question", "name": "How accurate are the results?", "acceptedAnswer": {"@type": "Answer", "text": "Results are estimates based on standard formulas. For critical decisions, please consult a qualified professional."}}]})}} />
      
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: `{
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "JSON Tree Viewer",
  "description": "Visualize JSON as an interactive collapsible tree",
  "url": "https://tools.loresync.dev/json-tree-viewer",
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
