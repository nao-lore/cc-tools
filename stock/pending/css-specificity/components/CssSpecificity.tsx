"use client";

import { useState, useCallback, useMemo } from "react";

// --- Specificity types ---

interface Specificity {
  a: number; // ID selectors
  b: number; // classes, attributes, pseudo-classes
  c: number; // elements, pseudo-elements
}

interface SelectorRow {
  id: string;
  value: string;
}

// --- Parser ---

function parseSpecificity(selector: string): Specificity {
  let s = selector.trim();

  // Remove string contents to avoid false matches
  s = s.replace(/(['"]).*?\1/g, "");

  let a = 0;
  let b = 0;
  let c = 0;

  // Strip :not(), :is(), :has(), :where() — :where() contributes 0
  // :not/:is/:has arguments count; :where arguments do not
  // Simple approach: extract content of :not(), :is(), :has() and count it, remove :where()
  const processParens = (input: string): string => {
    return input
      .replace(/:where\([^)]*\)/g, "") // :where() → 0 specificity
      .replace(/:(not|is|has)\(([^)]*)\)/g, (_match, _fn, args) => {
        // The args contribute specificity; replace with a placeholder that we'll count
        return args;
      });
  };

  s = processParens(s);

  // Count IDs: #foo
  const idMatches = s.match(/#[\w-]+/g) ?? [];
  a += idMatches.length;
  s = s.replace(/#[\w-]+/g, "");

  // Count pseudo-elements: ::before, ::after, etc. (must come before pseudo-classes)
  const pseudoElementMatches = s.match(/::[\w-]+/g) ?? [];
  c += pseudoElementMatches.length;
  s = s.replace(/::[\w-]+/g, "");

  // Count classes: .foo
  const classMatches = s.match(/\.[\w-]+/g) ?? [];
  b += classMatches.length;
  s = s.replace(/\.[\w-]+/g, "");

  // Count attribute selectors: [attr], [attr=val], etc.
  const attrMatches = s.match(/\[[^\]]*\]/g) ?? [];
  b += attrMatches.length;
  s = s.replace(/\[[^\]]*\]/g, "");

  // Count pseudo-classes: :hover, :focus, :nth-child(), etc.
  const pseudoClassMatches = s.match(/:[\w-]+(?:\([^)]*\))?/g) ?? [];
  b += pseudoClassMatches.length;
  s = s.replace(/:[\w-]+(?:\([^)]*\))?/g, "");

  // Count element type selectors (remaining word tokens, excluding * and combinators)
  const elementMatches = s.match(/[a-zA-Z][\w-]*/g) ?? [];
  c += elementMatches.length;

  return { a, b, c };
}

function specificityScore(sp: Specificity): number {
  // Compare as a weighted number for ordering (a*10000 + b*100 + c)
  return sp.a * 10000 + sp.b * 100 + sp.c;
}

function formatSpecificity(sp: Specificity): string {
  return `(${sp.a},${sp.b},${sp.c})`;
}

function compareSpecificity(x: Specificity, y: Specificity): number {
  if (x.a !== y.a) return x.a - y.a;
  if (x.b !== y.b) return x.b - y.b;
  return x.c - y.c;
}

// --- Quick reference examples ---

const EXAMPLES = [
  { selector: "*", label: "Universal selector", specificity: "(0,0,0)" },
  { selector: "div", label: "Element", specificity: "(0,0,1)" },
  { selector: ".class", label: "Class", specificity: "(0,1,0)" },
  { selector: "#id", label: "ID", specificity: "(1,0,0)" },
  { selector: "div p", label: "Two elements", specificity: "(0,0,2)" },
  { selector: "div.active", label: "Element + class", specificity: "(0,1,1)" },
  { selector: "#nav .item a", label: "ID + class + element", specificity: "(1,1,1)" },
  { selector: "a:hover", label: "Element + pseudo-class", specificity: "(0,1,1)" },
  { selector: "p::first-line", label: "Element + pseudo-element", specificity: "(0,0,2)" },
  { selector: "[type=\"text\"]", label: "Attribute selector", specificity: "(0,1,0)" },
  { selector: ".nav li:nth-child(2)", label: "Class + element + pseudo-class", specificity: "(0,2,1)" },
  { selector: "#main .sidebar > ul li.active", label: "Complex selector", specificity: "(1,2,2)" },
];

// --- Segment bar ---

interface SegmentBarProps {
  sp: Specificity;
  maxScore: number;
  isWinner: boolean;
}

function SegmentBar({ sp, maxScore, isWinner }: SegmentBarProps) {
  const score = specificityScore(sp);
  const pct = maxScore > 0 ? (score / maxScore) * 100 : 0;

  const aWidth = sp.a > 0 ? Math.max(sp.a * 10, 4) : 0;
  const bWidth = sp.b > 0 ? Math.max(sp.b * 6, 4) : 0;
  const cWidth = sp.c > 0 ? Math.max(sp.c * 3, 4) : 0;

  return (
    <div className="space-y-1.5">
      {/* Overall bar */}
      <div className="h-2 bg-border rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-300 ${
            isWinner
              ? "bg-gradient-to-r from-violet-500 to-fuchsia-500"
              : "bg-gradient-to-r from-blue-400 to-cyan-400"
          }`}
          style={{ width: `${Math.max(pct, score > 0 ? 2 : 0)}%` }}
        />
      </div>
      {/* Segment breakdown */}
      <div className="flex items-center gap-1 h-3">
        {sp.a > 0 && (
          <div
            className="h-3 rounded bg-violet-500 flex items-center justify-center"
            style={{ width: `${aWidth}px`, minWidth: `${aWidth}px` }}
            title={`${sp.a} ID${sp.a > 1 ? "s" : ""}`}
          >
            <span className="text-[9px] text-white font-bold leading-none">{sp.a}</span>
          </div>
        )}
        {sp.b > 0 && (
          <div
            className="h-3 rounded bg-blue-500 flex items-center justify-center"
            style={{ width: `${bWidth}px`, minWidth: `${bWidth}px` }}
            title={`${sp.b} class/attr/pseudo-class`}
          >
            <span className="text-[9px] text-white font-bold leading-none">{sp.b}</span>
          </div>
        )}
        {sp.c > 0 && (
          <div
            className="h-3 rounded bg-cyan-500 flex items-center justify-center"
            style={{ width: `${cWidth}px`, minWidth: `${cWidth}px` }}
            title={`${sp.c} element/pseudo-element`}
          >
            <span className="text-[9px] text-white font-bold leading-none">{sp.c}</span>
          </div>
        )}
        {sp.a === 0 && sp.b === 0 && sp.c === 0 && (
          <span className="text-xs text-muted">0</span>
        )}
      </div>
    </div>
  );
}

// --- Main component ---

let nextId = 0;
function makeId() {
  return String(++nextId);
}

const DEFAULT_SELECTORS: SelectorRow[] = [
  { id: makeId(), value: "#nav .item a" },
  { id: makeId(), value: ".nav li.active" },
  { id: makeId(), value: "div p.text" },
];

export default function CssSpecificity() {
  const [rows, setRows] = useState<SelectorRow[]>(DEFAULT_SELECTORS);

  const addRow = useCallback(() => {
    setRows((prev) => [...prev, { id: makeId(), value: "" }]);
  }, []);

  const removeRow = useCallback((id: string) => {
    setRows((prev) => prev.filter((r) => r.id !== id));
  }, []);

  const updateRow = useCallback((id: string, value: string) => {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, value } : r)));
  }, []);

  const loadExample = useCallback((selector: string) => {
    setRows((prev) => {
      // If there's an empty row, fill the first one
      const emptyIdx = prev.findIndex((r) => r.value.trim() === "");
      if (emptyIdx >= 0) {
        const next = [...prev];
        next[emptyIdx] = { ...next[emptyIdx], value: selector };
        return next;
      }
      return [...prev, { id: makeId(), value: selector }];
    });
  }, []);

  const parsed = useMemo(
    () =>
      rows.map((r) => ({
        ...r,
        sp: r.value.trim() ? parseSpecificity(r.value) : null,
      })),
    [rows]
  );

  const maxScore = useMemo(() => {
    const scores = parsed
      .filter((r) => r.sp !== null)
      .map((r) => specificityScore(r.sp!));
    return scores.length > 0 ? Math.max(...scores) : 0;
  }, [parsed]);

  const winnerIds = useMemo(() => {
    const valid = parsed.filter((r) => r.sp !== null);
    if (valid.length === 0) return new Set<string>();
    const best = valid.reduce((acc, cur) =>
      compareSpecificity(cur.sp!, acc.sp!) > 0 ? cur : acc
    );
    const bestScore = specificityScore(best.sp!);
    return new Set(
      valid.filter((r) => specificityScore(r.sp!) === bestScore).map((r) => r.id)
    );
  }, [parsed]);

  const sortedForRanking = useMemo(() => {
    return [...parsed]
      .filter((r) => r.sp !== null)
      .sort((a, b) => compareSpecificity(b.sp!, a.sp!));
  }, [parsed]);

  return (
    <div className="space-y-6">
      {/* Selector inputs */}
      <div className="bg-surface rounded-2xl border border-border overflow-hidden">
        <div className="px-4 py-3 border-b border-border flex items-center justify-between">
          <h2 className="text-sm font-medium text-foreground">CSS Selectors</h2>
          <button
            onClick={addRow}
            className="flex items-center gap-1.5 text-sm text-accent hover:text-accent/80 font-medium transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add selector
          </button>
        </div>

        <div className="divide-y divide-border">
          {rows.map((row, idx) => {
            const result = parsed.find((p) => p.id === row.id);
            const sp = result?.sp ?? null;
            const isWinner = winnerIds.has(row.id);

            return (
              <div key={row.id} className="px-4 py-3 flex items-center gap-3">
                {/* Index */}
                <span className="text-xs text-muted w-5 shrink-0 text-right font-mono">
                  {idx + 1}
                </span>

                {/* Input */}
                <div className="flex-1 relative">
                  <input
                    type="text"
                    value={row.value}
                    onChange={(e) => updateRow(row.id, e.target.value)}
                    placeholder="e.g. #nav .item a"
                    className={`w-full bg-background border rounded-lg px-3 py-2 text-sm font-mono text-foreground focus:outline-none focus:ring-2 transition-colors ${
                      isWinner && sp !== null
                        ? "border-violet-400 focus:ring-violet-400/30"
                        : "border-border focus:ring-accent/30"
                    }`}
                  />
                  {isWinner && sp !== null && (
                    <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-semibold text-violet-500 bg-violet-50 dark:bg-violet-900/20 px-1.5 py-0.5 rounded">
                      Wins
                    </span>
                  )}
                </div>

                {/* Specificity score */}
                <div className="w-24 shrink-0">
                  {sp !== null ? (
                    <div className="space-y-0.5">
                      <span
                        className={`block text-sm font-mono font-bold ${
                          isWinner ? "text-violet-600 dark:text-violet-400" : "text-foreground"
                        }`}
                      >
                        {formatSpecificity(sp)}
                      </span>
                      <SegmentBar sp={sp} maxScore={maxScore} isWinner={isWinner} />
                    </div>
                  ) : (
                    <span className="text-xs text-muted font-mono">—</span>
                  )}
                </div>

                {/* Remove button */}
                <button
                  onClick={() => removeRow(row.id)}
                  disabled={rows.length <= 1}
                  className="shrink-0 p-1 rounded text-muted hover:text-red-500 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  aria-label="Remove selector"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-4 text-xs text-muted px-1">
        <span className="font-medium text-foreground">Color key:</span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded bg-violet-500 inline-block" />
          A — ID selectors
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded bg-blue-500 inline-block" />
          B — Classes / attributes / pseudo-classes
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded bg-cyan-500 inline-block" />
          C — Elements / pseudo-elements
        </span>
      </div>

      {/* Ranked results */}
      {sortedForRanking.length > 1 && (
        <div className="bg-surface rounded-2xl border border-border overflow-hidden">
          <div className="px-4 py-3 border-b border-border">
            <h2 className="text-sm font-medium text-foreground">Ranked by Specificity</h2>
          </div>
          <div className="divide-y divide-border">
            {sortedForRanking.map((row, rank) => {
              const isWinner = winnerIds.has(row.id);
              return (
                <div key={row.id} className="px-4 py-3 flex items-center gap-4">
                  <span
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                      rank === 0
                        ? "bg-violet-500 text-white"
                        : "bg-border text-muted"
                    }`}
                  >
                    {rank + 1}
                  </span>
                  <code className="flex-1 text-sm font-mono text-foreground truncate">
                    {row.value}
                  </code>
                  <span
                    className={`text-sm font-mono font-bold shrink-0 ${
                      isWinner ? "text-violet-600 dark:text-violet-400" : "text-muted"
                    }`}
                  >
                    {formatSpecificity(row.sp!)}
                  </span>
                  <div className="w-32 shrink-0">
                    <SegmentBar sp={row.sp!} maxScore={maxScore} isWinner={isWinner} />
                  </div>
                
      {/* FAQ */}
      <section className="mt-12 space-y-4">
        <h2 className="text-lg font-bold text-gray-800">Frequently Asked Questions</h2>
        <div className="space-y-3">
    <details className="bg-gray-50 rounded-lg p-4 open:bg-gray-100">
      <summary className="font-medium text-gray-700 cursor-pointer select-none">What does this CSS Specificity Calculator tool do?</summary>
      <p className="mt-2 text-sm text-gray-600">Calculate and compare CSS selector specificity. Just enter your values and get instant results.</p>
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
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify({"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [{"@type": "Question", "name": "What does this CSS Specificity Calculator tool do?", "acceptedAnswer": {"@type": "Answer", "text": "Calculate and compare CSS selector specificity. Just enter your values and get instant results."}}, {"@type": "Question", "name": "Is this tool free to use?", "acceptedAnswer": {"@type": "Answer", "text": "Yes, completely free. No sign-up or account required."}}, {"@type": "Question", "name": "How accurate are the results?", "acceptedAnswer": {"@type": "Answer", "text": "Results are estimates based on standard formulas. For critical decisions, please consult a qualified professional."}}]})}} />
      </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Quick reference */}
      <div className="bg-surface rounded-2xl border border-border overflow-hidden">
        <div className="px-4 py-3 border-b border-border">
          <h2 className="text-sm font-medium text-foreground">Quick Reference Examples</h2>
          <p className="text-xs text-muted mt-0.5">Click any row to add it to the calculator</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left px-4 py-2 text-xs font-medium text-muted">Selector</th>
                <th className="text-left px-4 py-2 text-xs font-medium text-muted hidden sm:table-cell">Description</th>
                <th className="text-center px-4 py-2 text-xs font-medium text-muted">
                  <span className="text-violet-500">A</span>
                  <span className="text-muted">,</span>
                  <span className="text-blue-500">B</span>
                  <span className="text-muted">,</span>
                  <span className="text-cyan-500">C</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {EXAMPLES.map((ex, i) => (
                <tr
                  key={i}
                  className="border-b border-border last:border-0 hover:bg-surface-hover cursor-pointer transition-colors"
                  onClick={() => loadExample(ex.selector)}
                >
                  <td className="px-4 py-2.5">
                    <code className="text-xs font-mono text-accent">{ex.selector}</code>
                  </td>
                  <td className="px-4 py-2.5 text-xs text-muted hidden sm:table-cell">{ex.label}</td>
                  <td className="px-4 py-2.5 text-center">
                    <span className="font-mono text-xs font-semibold text-foreground">
                      {ex.specificity}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Ad placeholder */}
      <div className="w-full h-24 rounded-xl border border-dashed border-border flex items-center justify-center text-muted text-sm">
        Advertisement
      </div>
    
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: `{
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "CSS Specificity Calculator",
  "description": "Calculate and compare CSS selector specificity",
  "url": "https://tools.loresync.dev/css-specificity",
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
