"use client";

import { useState, useCallback } from "react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type JsonValue =
  | string
  | number
  | boolean
  | null
  | JsonValue[]
  | { [key: string]: JsonValue };

type DiffKind = "added" | "removed" | "changed" | "unchanged" | "nested";

interface DiffNode {
  key: string;
  kind: DiffKind;
  oldValue?: JsonValue;
  newValue?: JsonValue;
  children?: DiffNode[];
}

interface Summary {
  added: number;
  removed: number;
  changed: number;
}

// ---------------------------------------------------------------------------
// Deep diff engine
// ---------------------------------------------------------------------------

function isObject(v: JsonValue): v is { [key: string]: JsonValue } {
  return v !== null && typeof v === "object" && !Array.isArray(v);
}

function deepEqual(a: JsonValue, b: JsonValue): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
}

function diffObjects(
  a: { [key: string]: JsonValue },
  b: { [key: string]: JsonValue },
  path: string
): DiffNode[] {
  const allKeys = new Set([...Object.keys(a), ...Object.keys(b)]);
  const nodes: DiffNode[] = [];

  for (const key of allKeys) {
    const fullKey = path ? `${path}.${key}` : key;
    const inA = key in a;
    const inB = key in b;

    if (!inA) {
      nodes.push({ key, kind: "added", newValue: b[key] });
    } else if (!inB) {
      nodes.push({ key, kind: "removed", oldValue: a[key] });
    } else {
      const aVal = a[key];
      const bVal = b[key];

      if (deepEqual(aVal, bVal)) {
        nodes.push({ key, kind: "unchanged", oldValue: aVal, newValue: bVal });
      } else if (isObject(aVal) && isObject(bVal)) {
        const children = diffObjects(aVal, bVal, fullKey);
        nodes.push({ key, kind: "nested", children });
      } else if (Array.isArray(aVal) && Array.isArray(bVal)) {
        // Diff arrays element-by-element
        const children = diffArrays(aVal, bVal, fullKey);
        nodes.push({ key, kind: "nested", children });
      } else {
        nodes.push({ key, kind: "changed", oldValue: aVal, newValue: bVal });
      }
    }
  }

  // Sort: changed/added/removed first, then unchanged
  nodes.sort((a, b) => {
    const order = (k: DiffKind) =>
      k === "unchanged" ? 1 : 0;
    return order(a.kind) - order(b.kind);
  });

  return nodes;
}

function diffArrays(
  a: JsonValue[],
  b: JsonValue[],
  path: string
): DiffNode[] {
  const maxLen = Math.max(a.length, b.length);
  const nodes: DiffNode[] = [];

  for (let i = 0; i < maxLen; i++) {
    const key = `[${i}]`;
    const fullKey = `${path}${key}`;

    if (i >= a.length) {
      nodes.push({ key, kind: "added", newValue: b[i] });
    } else if (i >= b.length) {
      nodes.push({ key, kind: "removed", oldValue: a[i] });
    } else {
      const aVal = a[i];
      const bVal = b[i];

      if (deepEqual(aVal, bVal)) {
        nodes.push({ key, kind: "unchanged", oldValue: aVal, newValue: bVal });
      } else if (isObject(aVal) && isObject(bVal)) {
        nodes.push({ key, kind: "nested", children: diffObjects(aVal, bVal, fullKey) });
      } else if (Array.isArray(aVal) && Array.isArray(bVal)) {
        nodes.push({ key, kind: "nested", children: diffArrays(aVal, bVal, fullKey) });
      } else {
        nodes.push({ key, kind: "changed", oldValue: aVal, newValue: bVal });
      }
    }
  }

  return nodes;
}

function countSummary(nodes: DiffNode[]): Summary {
  const s: Summary = { added: 0, removed: 0, changed: 0 };
  for (const node of nodes) {
    if (node.kind === "added") s.added++;
    else if (node.kind === "removed") s.removed++;
    else if (node.kind === "changed") s.changed++;
    if (node.children) {
      const sub = countSummary(node.children);
      s.added += sub.added;
      s.removed += sub.removed;
      s.changed += sub.changed;
    }
  }
  return s;
}

// ---------------------------------------------------------------------------
// Rendering helpers
// ---------------------------------------------------------------------------

function kindStyles(kind: DiffKind) {
  switch (kind) {
    case "added":
      return {
        row: "bg-green-50 border-l-4 border-green-400",
        badge: "bg-green-100 text-green-700",
        label: "+",
        key: "text-green-800",
        value: "text-green-700",
      };
    case "removed":
      return {
        row: "bg-red-50 border-l-4 border-red-400",
        badge: "bg-red-100 text-red-700",
        label: "−",
        key: "text-red-800",
        value: "text-red-700",
      };
    case "changed":
      return {
        row: "bg-yellow-50 border-l-4 border-yellow-400",
        badge: "bg-yellow-100 text-yellow-700",
        label: "~",
        key: "text-yellow-800",
        value: "text-yellow-700",
      };
    default:
      return {
        row: "bg-white border-l-4 border-transparent",
        badge: "bg-gray-100 text-gray-500",
        label: " ",
        key: "text-gray-600",
        value: "text-gray-500",
      };
  }
}

function formatValue(v: JsonValue): string {
  if (v === null) return "null";
  if (typeof v === "string") return `"${v}"`;
  if (typeof v === "boolean" || typeof v === "number") return String(v);
  if (Array.isArray(v)) return `[Array(${v.length})]`;
  return `{Object(${Object.keys(v).length})}`;
}

// ---------------------------------------------------------------------------
// DiffRow component
// ---------------------------------------------------------------------------

interface DiffRowProps {
  node: DiffNode;
  depth: number;
  expandedKeys: Set<string>;
  onToggle: (pathKey: string) => void;
  pathKey: string;
}

function DiffRow({ node, depth, expandedKeys, onToggle, pathKey }: DiffRowProps) {
  const styles = kindStyles(node.kind);
  const isNested = node.kind === "nested" && node.children;
  const isExpanded = expandedKeys.has(pathKey);
  const [showDetail, setShowDetail] = useState(false);

  const indent = depth * 16;

  return (
    <>
      <div
        className={`flex items-start gap-2 px-3 py-2 text-sm font-mono border-b border-gray-100 ${styles.row} ${
          isNested || node.kind === "changed" ? "cursor-pointer hover:opacity-90" : ""
        }`}
        style={{ paddingLeft: `${indent + 12}px` }}
        onClick={() => {
          if (isNested) onToggle(pathKey);
          else if (node.kind === "changed") setShowDetail((v) => !v);
        }}
      >
        {/* Kind badge */}
        <span
          className={`flex-shrink-0 w-5 h-5 rounded flex items-center justify-center text-xs font-bold ${styles.badge}`}
        >
          {styles.label}
        </span>

        {/* Key */}
        <span className={`font-semibold ${styles.key}`}>{node.key}</span>

        {/* Separator + value */}
        {node.kind !== "nested" && (
          <>
            <span className="text-gray-400">:</span>
            {node.kind === "changed" ? (
              <span className="flex items-center gap-1 flex-wrap">
                <span className="line-through text-red-500 opacity-70">
                  {formatValue(node.oldValue as JsonValue)}
                </span>
                <span className="text-gray-400">→</span>
                <span className="text-green-600 font-semibold">
                  {formatValue(node.newValue as JsonValue)}
                </span>
                <span className="text-xs text-gray-400 ml-1">(click to expand)</span>
              </span>
            ) : node.kind === "added" ? (
              <span className={styles.value}>{formatValue(node.newValue as JsonValue)}</span>
            ) : node.kind === "removed" ? (
              <span className={`${styles.value} line-through`}>{formatValue(node.oldValue as JsonValue)}</span>
            ) : (
              <span className={styles.value}>{formatValue(node.oldValue as JsonValue)}</span>
            )}
          </>
        )}

        {/* Nested expand indicator */}
        {isNested && (
          <span className="ml-auto text-gray-400 text-xs select-none">
            {isExpanded ? "▾" : "▸"} {node.children!.length} keys
          </span>
        )}
      </div>

      {/* Changed detail panel */}
      {node.kind === "changed" && showDetail && (
        <div
          className="bg-yellow-50 border-b border-gray-100 px-4 py-3 grid grid-cols-2 gap-4 text-xs font-mono"
          style={{ paddingLeft: `${indent + 12}px` }}
        >
          <div>
            <p className="text-red-600 font-bold mb-1">Before (JSON A)</p>
            <pre className="bg-red-50 border border-red-200 rounded p-2 overflow-auto text-red-700 whitespace-pre-wrap break-all">
              {JSON.stringify(node.oldValue, null, 2)}
            </pre>
          </div>
          <div>
            <p className="text-green-600 font-bold mb-1">After (JSON B)</p>
            <pre className="bg-green-50 border border-green-200 rounded p-2 overflow-auto text-green-700 whitespace-pre-wrap break-all">
              {JSON.stringify(node.newValue, null, 2)}
            </pre>
          </div>
        </div>
      )}

      {/* Nested children */}
      {isNested && isExpanded &&
        node.children!.map((child, i) => (
          <DiffRow
            key={i}
            node={child}
            depth={depth + 1}
            expandedKeys={expandedKeys}
            onToggle={onToggle}
            pathKey={`${pathKey}.${child.key}`}
          />
        ))}
    </>
  );
}

// ---------------------------------------------------------------------------
// Sample data
// ---------------------------------------------------------------------------

const SAMPLE_A = `{
  "name": "Alice",
  "age": 30,
  "email": "alice@example.com",
  "role": "user",
  "address": {
    "city": "Tokyo",
    "zip": "100-0001"
  },
  "tags": ["developer", "designer"],
  "active": true
}`;

const SAMPLE_B = `{
  "name": "Alice",
  "age": 31,
  "email": "alice@new-domain.com",
  "role": "admin",
  "address": {
    "city": "Osaka",
    "zip": "530-0001",
    "country": "Japan"
  },
  "tags": ["developer", "manager"],
  "verified": true
}`;

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export default function JsonDiff() {
  const [jsonA, setJsonA] = useState("");
  const [jsonB, setJsonB] = useState("");
  const [diff, setDiff] = useState<DiffNode[] | null>(null);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [parseError, setParseError] = useState<string | null>(null);
  const [expandedKeys, setExpandedKeys] = useState<Set<string>>(new Set());
  const [hideUnchanged, setHideUnchanged] = useState(false);

  const handleCompare = useCallback(() => {
    setParseError(null);
    setDiff(null);
    setSummary(null);
    setExpandedKeys(new Set());

    let parsedA: JsonValue;
    let parsedB: JsonValue;

    try {
      parsedA = JSON.parse(jsonA);
    } catch (e) {
      setParseError(`JSON A parse error: ${(e as Error).message}`);
      return;
    }

    try {
      parsedB = JSON.parse(jsonB);
    } catch (e) {
      setParseError(`JSON B parse error: ${(e as Error).message}`);
      return;
    }

    let nodes: DiffNode[];

    if (isObject(parsedA) && isObject(parsedB)) {
      nodes = diffObjects(parsedA, parsedB, "");
    } else if (Array.isArray(parsedA) && Array.isArray(parsedB)) {
      nodes = diffArrays(parsedA, parsedB, "");
    } else if (deepEqual(parsedA, parsedB)) {
      nodes = [{ key: "(root)", kind: "unchanged", oldValue: parsedA, newValue: parsedB }];
    } else {
      nodes = [{ key: "(root)", kind: "changed", oldValue: parsedA, newValue: parsedB }];
    }

    setDiff(nodes);
    setSummary(countSummary(nodes));

    // Auto-expand top-level nested nodes that have changes
    const autoExpand = new Set<string>();
    for (const node of nodes) {
      if (node.kind === "nested" && node.children) {
        const hasDiff = node.children.some((c) => c.kind !== "unchanged");
        if (hasDiff) autoExpand.add(node.key);
      }
    }
    setExpandedKeys(autoExpand);
  }, [jsonA, jsonB]);

  const handleFormat = useCallback((which: "a" | "b") => {
    try {
      if (which === "a") {
        setJsonA(JSON.stringify(JSON.parse(jsonA), null, 2));
      } else {
        setJsonB(JSON.stringify(JSON.parse(jsonB), null, 2));
      }
    } catch {
      // ignore parse errors on format
    }
  }, [jsonA, jsonB]);

  const handleLoadSample = useCallback(() => {
    setJsonA(SAMPLE_A);
    setJsonB(SAMPLE_B);
    setDiff(null);
    setSummary(null);
    setParseError(null);
    setExpandedKeys(new Set());
  }, []);

  const handleClear = useCallback(() => {
    setJsonA("");
    setJsonB("");
    setDiff(null);
    setSummary(null);
    setParseError(null);
    setExpandedKeys(new Set());
  }, []);

  const handleToggle = useCallback((pathKey: string) => {
    setExpandedKeys((prev) => {
      const next = new Set(prev);
      if (next.has(pathKey)) next.delete(pathKey);
      else next.add(pathKey);
      return next;
    });
  }, []);

  const visibleDiff = hideUnchanged
    ? diff?.filter((n) => n.kind !== "unchanged")
    : diff;

  const totalDiffs = summary
    ? summary.added + summary.removed + summary.changed
    : 0;

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3">
        <button
          onClick={handleCompare}
          className="px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors cursor-pointer"
        >
          Compare
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

      {/* Input panels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* JSON A */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-gray-500">JSON A (original)</label>
            <button
              onClick={() => handleFormat("a")}
              className="text-xs text-blue-600 hover:text-blue-800 px-2 py-0.5 border border-blue-200 rounded hover:bg-blue-50 transition-colors cursor-pointer"
            >
              Format
            </button>
          </div>
          <textarea
            value={jsonA}
            onChange={(e) => {
              setJsonA(e.target.value);
              setDiff(null);
              setSummary(null);
              setParseError(null);
            }}
            placeholder={'Paste JSON A here...\n\n{"name": "Alice", "age": 30}'}
            spellCheck={false}
            className="w-full h-64 p-4 font-mono text-sm border border-gray-200 rounded-lg bg-gray-50 text-gray-800 resize-y focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-gray-300 placeholder-gray-400"
          />
        </div>

        {/* JSON B */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-gray-500">JSON B (modified)</label>
            <button
              onClick={() => handleFormat("b")}
              className="text-xs text-blue-600 hover:text-blue-800 px-2 py-0.5 border border-blue-200 rounded hover:bg-blue-50 transition-colors cursor-pointer"
            >
              Format
            </button>
          </div>
          <textarea
            value={jsonB}
            onChange={(e) => {
              setJsonB(e.target.value);
              setDiff(null);
              setSummary(null);
              setParseError(null);
            }}
            placeholder={'Paste JSON B here...\n\n{"name": "Alice", "age": 31}'}
            spellCheck={false}
            className="w-full h-64 p-4 font-mono text-sm border border-gray-200 rounded-lg bg-gray-50 text-gray-800 resize-y focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-gray-300 placeholder-gray-400"
          />
        </div>
      </div>

      {/* Parse error */}
      {parseError && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700 font-mono">
          {parseError}
        </div>
      )}

      {/* Results */}
      {diff !== null && summary !== null && (
        <div className="border border-gray-200 rounded-lg overflow-hidden">
          {/* Summary bar */}
          <div className="flex flex-wrap items-center gap-4 px-4 py-3 bg-gray-50 border-b border-gray-200">
            <div className="flex items-center gap-3 flex-wrap">
              {totalDiffs === 0 ? (
                <span className="flex items-center gap-1.5 text-sm font-medium text-green-700">
                  <span className="w-2 h-2 rounded-full bg-green-500" />
                  No differences found — JSON objects are identical
                </span>
              ) : (
                <>
                  <span className="text-sm font-medium text-gray-700">
                    {totalDiffs} difference{totalDiffs !== 1 ? "s" : ""}
                  </span>
                  {summary.added > 0 && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
                      +{summary.added} added
                    </span>
                  )}
                  {summary.removed > 0 && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700">
                      −{summary.removed} removed
                    </span>
                  )}
                  {summary.changed > 0 && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700">
                      ~{summary.changed} changed
                    </span>
                  )}
                </>
              )}
            </div>
            <label className="ml-auto flex items-center gap-2 text-xs text-gray-500 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={hideUnchanged}
                onChange={(e) => setHideUnchanged(e.target.checked)}
                className="rounded"
              />
              Hide unchanged
            </label>
          </div>

          {/* Legend */}
          <div className="flex items-center gap-4 px-4 py-2 bg-white border-b border-gray-100 text-xs text-gray-500">
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-green-400 inline-block" /> Added</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-red-400 inline-block" /> Removed</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-yellow-400 inline-block" /> Changed</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-gray-200 inline-block" /> Unchanged</span>
          </div>

          {/* Diff tree */}
          <div className="divide-y divide-gray-50 bg-white font-mono text-sm">
            {visibleDiff && visibleDiff.length > 0 ? (
              visibleDiff.map((node, i) => (
                <DiffRow
                  key={i}
                  node={node}
                  depth={0}
                  expandedKeys={expandedKeys}
                  onToggle={handleToggle}
                  pathKey={node.key}
                />
              ))
            ) : (
              <div className="px-4 py-8 text-center text-gray-400 text-sm">
                {hideUnchanged ? "All keys are identical — uncheck \"Hide unchanged\" to see them." : "No results."}
              </div>
            )}
          </div>
        </div>
      )}
    
      {/* FAQ */}
      <section className="mt-12 space-y-4">
        <h2 className="text-lg font-bold text-gray-800">Frequently Asked Questions</h2>
        <div className="space-y-3">
    <details className="bg-gray-50 rounded-lg p-4 open:bg-gray-100">
      <summary className="font-medium text-gray-700 cursor-pointer select-none">What does this JSON Diff tool do?</summary>
      <p className="mt-2 text-sm text-gray-600">Compare two JSON objects and highlight differences. Just enter your values and get instant results.</p>
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
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify({"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [{"@type": "Question", "name": "What does this JSON Diff tool do?", "acceptedAnswer": {"@type": "Answer", "text": "Compare two JSON objects and highlight differences. Just enter your values and get instant results."}}, {"@type": "Question", "name": "Is this tool free to use?", "acceptedAnswer": {"@type": "Answer", "text": "Yes, completely free. No sign-up or account required."}}, {"@type": "Question", "name": "How accurate are the results?", "acceptedAnswer": {"@type": "Answer", "text": "Results are estimates based on standard formulas. For critical decisions, please consult a qualified professional."}}]})}} />
      </div>
  );
}
